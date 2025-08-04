const mongoose =require('mongoose');

const UserSchema =new mongoose.Schema({
  name:{
    type:String,
    required:true,
    trim: true
  },
  email:{
    type:String,
    unique: true,
    required:true,
    lowercase: true,
    trim: true
  },
  
  password:{
    type:String,
    required:true
  },
  role:{
    type:String,
    enum: ['student', 'teacher', 'admin'],
    required:true
  },
  class:{
    type:String,
    default:null
  },
},
{
  timestamps:true
});

module.exports=mongoose.model('User',UserSchema);