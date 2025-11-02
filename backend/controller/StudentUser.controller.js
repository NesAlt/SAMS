const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const Leave =require("../models/Leave")
const Event = require('../models/Event');
// const TeacherAssignment = require('../models/TeacherAssignment');
const WorkingDays = require("../models/WorkingDays");

exports.getMyAttendance = async (req, res) => {
  try {
    const studentId = new mongoose.Types.ObjectId(req.user.id);

    const student = await User.findById(studentId).lean();
    if (!student) {
      return res.status(404).json({ message: "Student not found." });
    }

    const attendanceRecords = await Attendance.find({ studentId })
      .populate({
        path: "timetable",
        select: "semester class subject",
      })
      .lean();

    if (!attendanceRecords.length) {
      return res.json({
        requiredPercentage: 75,
        overallPercentage: 0,
        totalWorkingDays: 0,
        status: "No Attendance Records",
        daily: [],
        monthly: [],
        semester: null,
      });
    }

    const semester = attendanceRecords[0]?.timetable?.semester;
    if (!semester) {
      return res.status(400).json({ message: "Semester info missing in records." });
    }

    const workingDays = await WorkingDays.findOne({ semester });
    if (!workingDays) {
      return res.status(404).json({
        message: "Working days not set for this semester.",
        overallPercentage: 0,
      });
    }

    const totalWorkingDays = workingDays.totalWorkingDays || 0;
    const presentCount = attendanceRecords.filter(a => a.status === "present").length;

    const overallPercentage =
      totalWorkingDays > 0 ? Math.round((presentCount / totalWorkingDays) * 100) : 0;

    const requiredPercentage = 75;
    const status = overallPercentage >= requiredPercentage ? "Above Required" : "Behind";

    const daily = attendanceRecords.map(a => ({
      date: a.date,
      class: a.timetable.class,
      subject: a.timetable.subject,
      status: a.status,
    }));

    const monthlyMap = {};
    attendanceRecords.forEach(a => {
      const key = `${a.date.getMonth() + 1}-${a.date.getFullYear()}`;
      if (!monthlyMap[key]) monthlyMap[key] = { total: 0, present: 0 };
      monthlyMap[key].total++;
      if (a.status === "present") monthlyMap[key].present++;
    });

    const monthly = Object.entries(monthlyMap).map(([key, stats]) => {
      const [month, year] = key.split("-");
      return {
        month: parseInt(month),
        year: parseInt(year),
        totalClasses: stats.total,
        present: stats.present,
        percentage: Math.round((stats.present / stats.total) * 100),
      };
    });

    res.json({
      requiredPercentage,
      overallPercentage,
      totalWorkingDays,
      status,
      daily,
      monthly,
      semester,
    });

  } catch (err) {
    console.error("Error fetching student attendance:", err);
    res.status(500).json({
      error: err.message || "Server error while fetching attendance",
    });
  }
};

exports.applyLeave = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { fromDate, toDate, reason, isEventLeave , eventId } = req.body;

    if (!fromDate || !toDate || !reason) {
      return res.status(400).json({ message: "All required fields must be filled." });
    }

    let leaveData = {
      studentId,
      fromDate,
      toDate,
      reason,
      isEventLeave: !!isEventLeave,
      status: "pending",
      reviewedBy: null
    };

    if (isEventLeave && eventId) {
      leaveData.eventId = eventId;
    }

    const newLeave = new Leave(leaveData);
    await newLeave.save();

    res.status(201).json({
      message: "Leave request submitted successfully.",
      leave: newLeave
    });
  } catch (err) {
    console.error("Error applying for leave:", err);
    res.status(500).json({ message: "Server error while applying for leave." });
  }
};

exports.getMyLeaves = async (req, res) => {
  try {
    const studentId = req.user._id;

    const leaves = await Leave.find({ studentId })
      .populate('reviewedBy', 'name role') // show teacher name if reviewed
      .sort({ appliedAt: -1 });

    res.status(200).json(leaves);
  } catch (err) {
    console.error('Error fetching leaves:', err);
    res.status(500).json({ message: 'Server error while fetching leaves.' });
  }
};

exports.deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave)
      return res.status(404).json({ message: 'Leave not found' });

    if (leave.studentId.toString() !== req.user.id)
      return res.status(403).json({ message: 'You are not authorized to delete this leave' });

    if (leave.status !== 'pending')
      return res.status(400).json({ message: 'Only pending leaves can be cancelled' });

    await Leave.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Leave cancelled successfully' });
  } catch (err) {
    console.error('Error deleting leave:', err);
    res.status(500).json({ message: 'Server error while cancelling leave' });
  }
};

exports.getAllEventsForStudents = async (req, res) => {
  try {
    const today = new Date();
    const events = await Event.find({
      endDate: { $gte: today }, 
    }).sort({ date: 1 });

    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events for students:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
};