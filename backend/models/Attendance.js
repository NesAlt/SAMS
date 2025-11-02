  const mongoose = require('mongoose');

  const AttendanceSchema = new mongoose.Schema({
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    timetable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Timetable',
    required: true
    },
    date: {
      type: Date,
      required: true
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'on_leave','duty_leave'],  
      required: true
    },
    reason: {
      type: String,
      default: ''
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
      from: {
      type: String,
      required: true
    },
    to: {
      type: String,
      required: true
    },
    approvedLeave: {
      type: Boolean,
      default: false
    },
    category: {
    type: String,
    enum: ['regular_class', 'revision', 'extra'],
    default: 'regular_class'
    }
  },{
    timestamps: true
  });

  module.exports = mongoose.model('Attendance', AttendanceSchema);
