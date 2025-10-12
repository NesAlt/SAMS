const mongoose = require("mongoose");
const Attendance = require("../models/Attendance");
const User = require("../models/User");

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