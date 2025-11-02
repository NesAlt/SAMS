const cron = require('node-cron');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Runs every day at midnight
cron.schedule('0 0 * * *', async () => {
  console.log("Running daily attendance check...");

  const students = await User.find({ role: 'student' });

  for (const student of students) {
    const records = await Attendance.find({ studentId: student._id });
    const total = records.length;
    const present = records.filter(r => r.status === 'present').length;

    if (total === 0) continue;

    const percentage = (present / total) * 100;

    // Check 1: Below eligibility
    if (percentage < 75) {
      await Notification.create({
        to: 'specific',
        toSpecific: student._id,
        message: `Your attendance is below 75%. Current: ${percentage.toFixed(1)}%.`,
        type: 'warning'
      });

      // Notify teacher(s)
      if (student.assignedTeacher) {
        await Notification.create({
          to: 'specific',
          toSpecific: student.assignedTeacher,
          message: `${student.name}'s attendance is below 75%.`,
          type: 'warning'
        });
      }
    }

    // Check 2: Too many leaves
    const leaves = records.filter(r => r.status === 'leave').length;
    if (leaves > 5) {
      await Notification.create({
        to: 'specific',
        toSpecific: student._id,
        message: `You have taken ${leaves} leaves this semester.`,
        type: 'warning'
      });
    }
  }

  console.log("Attendance notification cron completed.");
});