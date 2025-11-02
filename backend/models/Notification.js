const mongoose= require('mongoose')

const NotificationSchema = new mongoose.Schema({
  to:{
    type:String,
    enum:['all','students','teachers','specific'],
    required:true
  },
  toSpecific:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  message:{
    type:String,
    required:true
  },
  date:{
    type:Date,
    default: Date.now
  },
  type:{
    type:String,
    enum:['leave','reminder','announcement','warning'],
    required:true
  },
  readStatus:{
    type:Boolean,
    default:false
  }
},{ timestamps: true });

module.exports=mongoose.model('Notification',NotificationSchema);