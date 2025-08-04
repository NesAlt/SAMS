const mongoose = require('mongoose');

const TeacherAssignmentSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  class: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  semester: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TeacherAssignment', TeacherAssignmentSchema);