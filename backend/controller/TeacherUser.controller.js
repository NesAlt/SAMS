// const TeacherAssignment = require('../models/TeacherAssignment');
const mongoose = require("mongoose");
const Timetable=require("../models/Timetable.js");
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Leave = require("../models/Leave");
const { AttendanceSchema } = require('../dtos/attendance.dto');
const WorkingDays = require("../models/WorkingDays");
const { required } = require('joi');

exports.getAssignmentsByTeacher = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const teacherId = req.user.id;

    const timetables = await Timetable.find({ teacher: teacherId })
      .populate('teacher', 'name email');

    if (!timetables.length) {
      return res.status(404).json({ message: "No timetable entries found for this teacher" });
    }

    res.json(timetables);
  } catch (err) {
    console.error("Error fetching timetable entries:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { studentId, timetableId, date, status, reason } = req.body;

    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }

    const timetable = await Timetable.findById(timetableId);
    if (!timetable) {
      return res.status(404).json({ error: "Timetable entry not found" });
    }

    const formattedDate = new Date(date);

    let attendanceRecord = await Attendance.findOne({
      studentId,
      timetable:timetableId,
      date: formattedDate,
    });

    if (!attendanceRecord) {
      attendanceRecord = new Attendance({
        studentId,
        timetable: timetableId,
        date: formattedDate,
        status,
        reason: reason || "",
        markedBy: teacherId,
        from: timetable.startTime,
        to: timetable.endTime
      });
    } else {
      attendanceRecord.status = status;
      attendanceRecord.reason = reason || "";
    }

    await attendanceRecord.save();
    res.json({ message: "Attendance marked successfully", attendanceRecord });
  } catch (err) {
    console.error("Error marking attendance:", err);
    res.status(500).json({ error: "Server error while marking attendance" });
  }
};

exports.markBulkAttendance = async (req, res) => {
  try {
    const { timetable, date, students, category } = req.body;
    const teacherId = req.user.id;

    if (!timetable || !students || !Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ message: "Missing timetable or students list" });
    }

    const timetableDoc = await Timetable.findById(timetable);
    if (!timetableDoc) {
      return res.status(404).json({ message: "Timetable not found" });
    }

    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    const existing = await Attendance.findOne({
      timetable,
      date: { $gte: dayStart, $lte: dayEnd },
    });

    if (existing) {
      return res.status(400).json({ message: "Attendance already marked for this class." });
    }

    const attendanceDocs = students.map(s => ({
      studentId: s.studentId,
      timetable,
      date,
      status: s.status || "absent",
      markedBy: teacherId,
      from: timetableDoc.startTime,
      to: timetableDoc.endTime,
      category: category || "regular_class",
    }));

    await Attendance.insertMany(attendanceDocs);

    res.status(201).json({ message: "Attendance marked successfully!" });
  } catch (err) {
    console.error("Error marking attendance:", err);
    res.status(500).json({ message: "Error marking attendance." });
  }
};

exports.getAttendanceStatus = async (req, res) => {
  try {
    const { timetableId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(timetableId)) {
      console.error("Invalid timetable ID:", timetableId);
      return res.status(400).json({ message: "Invalid timetable ID" });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await Attendance.findOne({
      timetable: timetableId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    console.log(
      `Checked attendance for timetable ${timetableId}:`,
      attendance ? "found" : "not found"
    );

    res.json({ marked: !!attendance });
  } catch (err) {
    console.error("Error checking attendance status:", err);
    res.status(500).json({ message: "Error checking attendance status" });
  }
};

exports.getClassesBySemester = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { semester } = req.params;

    const timetables = await Timetable.find({ teacher: teacherId, semester });

    if (!timetables.length)
      return res.status(404).json({ message: "No classes found for this semester" });

    const classes = Array.from(
      new Map(
        timetables.map(t => [t.class + t.subject, { className: t.class, subject: t.subject }])
      ).values()
    );

    res.json(classes);
  } catch (err) {
    console.error("Error fetching classes:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAttendanceSummary = async (req, res) => {
  try {
    const { className } = req.params;
    const { filter } = req.query; // "month" or "semester"
    const teacherId = req.user.id;

    const timetable = await Timetable.findOne({ teacher: teacherId, class: className });
    if (!timetable)
      return res.status(404).json({ message: "No timetable found for this class" });

    const semester = timetable.semester;

    const workingDays = await WorkingDays.findOne({ semester });
    const totalWorkingDays = workingDays ? workingDays.totalWorkingDays : 0;

    const students = await User.find({ class: className, role: "student" });

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const dateFilter = filter === "month" ? { $gte: monthStart } : {};

    const studentData = await Promise.all(
      students.map(async (student) => {
        const attendanceRecords = await Attendance.find({
          studentId: student._id,
          timetable: timetable._id,
          date: dateFilter
        });

        const presentCount = attendanceRecords.filter(a => a.status === "present").length;
        const totalCount = attendanceRecords.length;

        const effectiveTotal = filter === "month" ? totalCount : totalWorkingDays;
        const percentage = effectiveTotal > 0 ? Math.round((presentCount / effectiveTotal) * 100) : 0;

        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          percentage
        };
      })
    );

    res.json(studentData);
  } catch (err) {
    console.error("Error fetching attendance summary:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getStudentsWithAttendance = async (req, res) => {
  try {
    const { className } = req.params;
    const { timetableId } = req.query;
    const teacherId = req.user.id;

    if (!timetableId) {
      return res.status(400).json({ message: "timetableId is required" });
    }

    const timetable = await Timetable.findOne({ _id: timetableId, teacher: teacherId });
    if (!timetable) {
      return res.status(404).json({ message: "No timetable entry found" });
    }

    const students = await User.find({ class: className, role: "student" });

    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const existingAttendance = await Attendance.find({
      timetable: timetableId,
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    const semester = timetable.semester;
    const workingDays = await WorkingDays.findOne({ semester });
    const totalWorkingDays = workingDays?.totalWorkingDays || 0;

    const studentData = await Promise.all(
      students.map(async (student) => {
        const presentCount = await Attendance.countDocuments({
          studentId: student._id,
          timetable: timetable._id,
          status: "present",
        });
        const approvedLeaveCount = await Leave.countDocuments({
          studentId: student._id,
          status: "approved",
        });

        const effectivePresent = presentCount + approvedLeaveCount;
        const percentage =
          totalWorkingDays > 0
            ? Math.round((effectivePresent / totalWorkingDays) * 100)
            : 0;

        const existing = existingAttendance.find(
          (att) => att.studentId.toString() === student._id.toString()
        );

        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          rollNo: student.rollNo,
          attendancePercentage: percentage,
          existingStatus: existing ? existing.status : null,
        };
      })
    );

    res.json({
      className,
      semester,
      totalWorkingDays,
      students: studentData,
      alreadyMarked: existingAttendance.length > 0,
    });
  } catch (err) {
    console.error("Error fetching students with attendance:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUpcomingClasses = async (req, res) => {
  try {
    const { semester } = req.params;
    const teacherId = req.user.id;

    const today = new Date();
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];

    const timetables = await Timetable.find({
      teacher: teacherId,
      semester,
    }).sort({ dayOfWeek: 1, startTime: 1 });

    const upcomingClasses = [];

    // Loop next 7 days
    for (let i = 0; i < 7; i++) {
      const current = new Date(today);
      current.setDate(today.getDate() + i);

      const dayName = daysOfWeek[current.getDay()];
      const classesToday = timetables.filter((t) => t.dayOfWeek === dayName);

      const dayStart = new Date(current);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(current);
      dayEnd.setHours(23, 59, 59, 999);

      const dayClasses = await Promise.all(
        classesToday.map(async (tt) => {
          const alreadyMarked = await Attendance.exists({
            timetable: tt._id,
            date: { $gte: dayStart, $lte: dayEnd },
          });

          return {
            ...tt.toObject(),
            date: new Date(current),
            isMarked: !!alreadyMarked, // ✅ add this flag
          };
        })
      );

      upcomingClasses.push(...dayClasses);
    }

    res.json(upcomingClasses);
  } catch (err) {
    console.error("Error fetching upcoming classes:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getClassLeaves = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const timetable = await Timetable.findOne({ teacher: teacherId });
    if (!timetable) {
      return res.status(404).json({ message: "No class assigned to this teacher." });
    }

    const students = await User.find({
      class: timetable.class,
      role: "student"
    }).select("_id name email class");

    const studentIds = students.map((s) => s._id);

    const leaves = await Leave.find({ studentId: { $in: studentIds } })
      .populate("studentId", "name email class")
      .populate("reviewedBy", "name email")
      .sort({ appliedAt: -1 });

    res.status(200).json(leaves);
  } catch (error) {
    console.error("Error fetching class leaves:", error);
    res.status(500).json({ message: "Failed to fetch leaves." });
  }
};

exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // "approved", "denied", "duty_leave"

    if (!["approved", "denied", "duty_leave"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value." });
    }

    const updatedLeave = await Leave.findByIdAndUpdate(
      id,
      { status, reviewedBy: req.user.id },
      { new: true }
    )
      .populate("studentId", "name class")
      .populate("reviewedBy", "name ");

    if (!updatedLeave) {
      return res.status(404).json({ message: "Leave not found." });
    }

    res.status(200).json(updatedLeave);
  } catch (error) {
    console.error("Error updating leave status:", error);
    res.status(500).json({ message: "Failed to update leave status." });
  }
};