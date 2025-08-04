const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title:{
    type:String,
    required:true
  },
  description: {
  type: String
  },
  date:{
    type:Date,
    required:true
  },
    endDate: {
    type: Date
  },
  type:{
    type:String,
    enum:['event','holiday'],
    required:true
  },
  createdBy:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
},{
  timestamps:true
});

module.exports= mongoose.model('Event',EventSchema);