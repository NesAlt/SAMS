const mongoose =require('mongoose');

const LeaveSchema = new mongoose.Schema({
  studentId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fromDate:{
    type:Date,
    required:true
  },
  toDate:{
    type:Date,
    required:true
  },
  reason:{
    type:String,
    required:true
  },
  status:{
    type: String,
    enum: ['pending', 'approved', 'denied'],
    default: 'pending'
  },
  reviewedBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appliedAt:{
    type: Date,
    default: Date.now
  }
});

module.exports=mongoose.model('Leave',LeaveSchema);