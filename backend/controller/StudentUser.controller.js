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
    const subjectFilter = req.query.subject;

    const attendanceRecords = await Attendance.find({ studentId })
      .populate({
        path: "timetable",
        select: "semester class subject",
      })
      .lean();

    if (!attendanceRecords.length) {
      return res.status(404).json({ message: "No attendance records found." });
    }

    // Filter by subject if provided
    let filteredRecords = attendanceRecords;
    if (subjectFilter) {
      filteredRecords = attendanceRecords.filter(
        (r) => r.timetable?.subject === subjectFilter
      );
    }

    if (!filteredRecords.length) {
      return res.status(404).json({ message: "No attendance found for this subject." });
    }

    // --- DAILY ATTENDANCE ---
    const daily = filteredRecords.map((record) => ({
      date: record.date,
      class: record.timetable.class,
      status: record.status,
    }));

    // --- MONTHLY ATTENDANCE ---
    const monthlyMap = {};
    filteredRecords.forEach((record) => {
      const monthKey = new Date(record.date).toLocaleString("default", {
        month: "short",
        year: "numeric",
      });
      if (!monthlyMap[monthKey]) monthlyMap[monthKey] = { present: 0, total: 0 };
      monthlyMap[monthKey].total++;
      if (record.status === "present") monthlyMap[monthKey].present++;
    });
    const monthly = Object.entries(monthlyMap).map(([month, data]) => ({
      month,
      percentage: ((data.present / data.total) * 100).toFixed(2),
    }));

    // --- SEMESTER ATTENDANCE ---
    const semester = filteredRecords[0].timetable.semester;
    const totalClasses = filteredRecords.length;
    const totalPresent = filteredRecords.filter((r) => r.status === "present").length;
    const overallPercentage = ((totalPresent / totalClasses) * 100).toFixed(2);
    const requiredPercentage = 75;
    const status = overallPercentage >= requiredPercentage ? "Above Required" : "Below Required";

    // --- RESPONSE ---
    res.json({
      subject: subjectFilter || "All Subjects",
      semester,
      overallPercentage,
      requiredPercentage,
      status,
      daily,
      monthly,
    });
  } catch (err) {
    console.error("Error fetching student attendance:", err);
    res.status(500).json({ message: "Server error fetching attendance." });
  }
};

exports.getMySubjects = async (req, res) => {
  try {
    const studentId = req.user.id;

    const subjects = await Attendance.aggregate([
      { $match: { studentId: new mongoose.Types.ObjectId(studentId) } },
      {
        $lookup: {
          from: "timetables",
          localField: "timetable",
          foreignField: "_id",
          as: "timetable",
        },
      },
      { $unwind: "$timetable" },
      {
        $group: {
          _id: "$timetable.subject",
          class: { $first: "$timetable.class" },
          semester: { $first: "$timetable.semester" },
        },
      },
      {
        $project: {
          _id: 0,
          subject: "$_id",
          class: 1,
          semester: 1,
        },
      },
    ]);

    if (!subjects.length) {
      return res.status(404).json({ message: "No subjects found." });
    }

    res.json(subjects);
  } catch (err) {
    console.error("Error fetching student subjects:", err);
    res.status(500).json({ message: "Server error fetching subjects." });
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