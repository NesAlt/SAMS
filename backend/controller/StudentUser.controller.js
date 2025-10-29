const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const Leave =require("../models/Leave")
const Event = require('../models/Event');

exports.getMyAttendance = async (req, res) => {
  try {

    // console.log("req.user:", req.user);
    // console.log("Searching attendance for studentId:", req.user.id);

    const studentId = new mongoose.Types.ObjectId(req.user.id);

    const attendanceRecords = await Attendance.find({ studentId });

    if (!attendanceRecords.length) {
      // console.log("attendanceRecords.length:", attendanceRecords.length);
      return res.json({
        requiredPercentage: 75,
        overallPercentage: 0,
        status: "No Attendance Records",
        daily: [],
        monthly: [],
        semester: [],
      });
    }

    const totalClasses = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(a => a.status === "present").length;
    const overallPercentage = Math.round((presentCount / totalClasses) * 100);
    const requiredPercentage = 75;
    const status = overallPercentage >= requiredPercentage ? "Above Required" : "Behind";
    const student = await User.findById(studentId);

    const daily = attendanceRecords.map(a => ({
      date: a.date,
      class: student.class || "N/A",
      status: a.status,
    }));

    const monthlyMap = {};
    attendanceRecords.forEach(a => {
      const monthKey = `${a.date.getMonth() + 1}-${a.date.getFullYear()}`;
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { total: 0, present: 0 };
      }
      monthlyMap[monthKey].total++;
      if (a.status === "present") monthlyMap[monthKey].present++;
    });

    const monthly = Object.entries(monthlyMap).map(([monthKey, stats]) => {
      const [month, year] = monthKey.split("-");
      return {
        month: parseInt(month),
        year: parseInt(year),
        totalClasses: stats.total,
        present: stats.present,
        percentage: Math.round((stats.present / stats.total) * 100),
      };
    });

    const semesterMap = {};
    attendanceRecords.forEach(a => {
      const sem = a.semester || "Unknown";
      if (!semesterMap[sem]) {
        semesterMap[sem] = { total: 0, present: 0 };
      }
      semesterMap[sem].total++;
      if (a.status === "present") semesterMap[sem].present++;
    });

    const semester = Object.entries(semesterMap).map(([sem, stats]) => ({
      semester: sem,
      totalClasses: stats.total,
      present: stats.present,
      percentage: Math.round((stats.present / stats.total) * 100),
    }));

    res.json({
      requiredPercentage,
      overallPercentage,
      status,
      daily,
      monthly,
      semester,
    });

  } catch (err) {
    console.error("Error fetching student attendance:", err);
    res.status(500).json({ error: "Server error while fetching attendance" });
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