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
  isEventLeave:{ 
    type: Boolean, 
    default: false 
  },
  eventId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Event',
  default: null
},
  status:{
    type: String,
    enum: ['pending', 'approved', 'denied','duty_leave'],
    default: 'pending'
  },
  reviewedBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default:null
  },
  appliedAt:{
    type: Date,
    default: Date.now
  }
});

module.exports=mongoose.model('Leave',LeaveSchema);