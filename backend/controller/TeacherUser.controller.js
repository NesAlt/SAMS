const TeacherAssignment = require('../models/TeacherAssignment');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Leave = require("../models/Leave");
const { AttendanceSchema } = require('../dtos/attendance.dto');

exports.getAssignmentsByTeacher = async (req, res) => {
  try {
    // console.log("Decoded user from token:", req.user);

    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized: No user in token" });
    }

    const teacherId = req.user.id;
    // console.log("Looking for assignments of teacher:", teacherId);

    const assignments = await TeacherAssignment.find({ teacher: teacherId })
      .populate('teacher', 'name email');

    // console.log("Assignments found:", assignments);

    if (!assignments.length) {
      return res.status(404).json({ message: "No assignments found for this teacher" });
    }

    res.json(assignments);
  } catch (err) {
    console.error("Error fetching teacher assignments:", err);
    res.status(500).json({ error: "Server error while getting assignments by teacher ID" });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const { error, value } = AttendanceSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { studentId, teacherAssignment, date, status, reason } = value;

    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ error: 'Student not found' });
    }

    const assignment = await TeacherAssignment.findById(teacherAssignment);
    if (!assignment) {
      return res.status(404).json({ error: 'Teacher assignment not found' });
    }

    let attendanceRecord = await Attendance.findOne({
      studentId:studentId,
      teacherAssignment:teacherAssignment,
      date: new Date(date)
    });

    if (!attendanceRecord) {
      attendanceRecord = new Attendance({
        studentId,
        teacherAssignment,
        date,
        status,
        reason: reason || '',
        markedBy: teacherId
      });
    } else {

      attendanceRecord.status = status;
      attendanceRecord.reason = reason || '';
      attendanceRecord.markedBy = teacherId;
    }

    await attendanceRecord.save();

    res.json({ message: 'Attendance marked successfully', attendanceRecord });

  } catch (err) {
    console.error('Error marking attendance:', err);
    res.status(500).json({ error: 'Server error while marking attendance' });
  }
};

exports.getStudentsWithAttendance = async (req, res) => {
  try {
    const { className } = req.params;

    const students = await User.find({ class: className, role: "student" }).lean();

    const studentsWithAttendance = await Promise.all(
      students.map(async (student) => {
        const total = await Attendance.countDocuments({ studentId: student._id });
        const present = await Attendance.countDocuments({
          studentId: student._id,
          status: "present",
        });

        const attendancePercentage = total > 0 ? Math.round((present / total) * 100) : null;

        return {
          ...student,
          attendancePercentage,
        };
      })
    );

    // console.log("Percentages:", studentsWithAttendance);
    res.json(studentsWithAttendance);
  } catch (err) {
    console.error("Error fetching students with attendance:", err);
    res.status(500).json({ error: "Server error fetching students" });
  }
};

exports.getClassLeaves = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const assignment = await TeacherAssignment.findOne({ teacher: teacherId });
    if (!assignment) {
      return res.status(404).json({ message: "No class assigned to this teacher." });
    }

    const students = await User.find({
      class: assignment.class,
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