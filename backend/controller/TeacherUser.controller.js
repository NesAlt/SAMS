const TeacherAssignment = require('../models/TeacherAssignment');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Leave = require("../models/Leave");
const { AttendanceSchema } = require('../dtos/attendance.dto');
const WorkingDays = require("../models/WorkingDays");

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
    if (!student || student.role !== "student") {
      return res.status(404).json({ error: "Student not found" });
    }

    const assignment = await TeacherAssignment.findById(teacherAssignment);
    if (!assignment) {
      return res.status(404).json({ error: "Teacher assignment not found" });
    }

    const formattedDate = new Date(date);

    // Check if record already exists
    let attendanceRecord = await Attendance.findOne({
      studentId,
      teacherAssignment,
      date: formattedDate,
    });

    if (!attendanceRecord) {
      attendanceRecord = new Attendance({
        studentId,
        teacherAssignment,
        date: formattedDate,
        status,
        reason: reason || "",
        markedBy: teacherId,
      });
    } else {
      attendanceRecord.status = status;
      attendanceRecord.reason = reason || "";
      attendanceRecord.markedBy = teacherId;
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
    const teacherId = req.user.id;
    const { teacherAssignment, date, students } = req.body;

    if (!teacherAssignment || !date || !students?.length) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const assignment = await TeacherAssignment.findById(teacherAssignment);
    if (!assignment) {
      return res.status(404).json({ error: "Teacher assignment not found" });
    }

    const formattedDate = new Date(date);

    // Save attendance for each student
    await Promise.all(
      students.map(async (s) => {
        let record = await Attendance.findOne({
          studentId: s.studentId,
          teacherAssignment,
          date: formattedDate,
        });

        if (record) {
          record.status = s.status;
          record.markedBy = teacherId;
          await record.save();
        } else {
          await Attendance.create({
            studentId: s.studentId,
            teacherAssignment,
            date: formattedDate,
            status: s.status,
            markedBy: teacherId,
          });
        }
      })
    );

    res.json({ message: "Bulk attendance saved successfully" });
  } catch (err) {
    console.error("Error marking bulk attendance:", err);
    res.status(500).json({ error: "Server error while marking bulk attendance" });
  }
};


exports.getStudentsWithAttendance = async (req, res) => {
  try {
    const { className } = req.params;
    const teacherId = req.user.id;

    // Find the teacher's assignment for this class
    const assignment = await TeacherAssignment.findOne({
      class: className,
      teacher: teacherId,
    });

    if (!assignment) {
      return res
        .status(404)
        .json({ message: "No teacher assignment found for this class." });
    }

    // Get the students in this class
    const students = await User.find({ class: className, role: "student" });

    // Find the semester of this class from the assignment
    const semester = assignment.semester;
    if (!semester) {
      return res.status(400).json({ message: "Semester not defined for this class." });
    }

    // Get total working days for the semester
    const workingDays = await WorkingDays.findOne({ semester });
    if (!workingDays) {
      return res.status(400).json({
        message: `Working days not set for semester ${semester}.`,
      });
    }

    const totalWorkingDays = workingDays.totalWorkingDays;

    // Map each student to their attendance stats
    const studentData = await Promise.all(
      students.map(async (student) => {
        const presentCount = await Attendance.countDocuments({
          studentId: student._id,
          teacherAssignment: assignment._id,
          status: "present",
        });

        const approvedLeaveCount = await Leave.countDocuments({
          studentId: student._id,
          status: "approved",
        });

        // Combine present + approved leaves as present
        const effectivePresent = presentCount + approvedLeaveCount;

        const percentage =
          totalWorkingDays > 0
            ? Math.round((effectivePresent / totalWorkingDays) * 100)
            : 0;

        return {
          _id: student._id,
          name: student.name,
          rollNo: student.rollNo,
          attendancePercentage: Number(percentage),
          onLeave: approvedLeaveCount > 0,
        };
      })
    );

    res.json({
      className,
      semester,
      totalWorkingDays,
      students: studentData,
    });
  } catch (err) {
    console.error("Error fetching students with attendance:", err);
    res.status(500).json({ message: "Server error" });
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