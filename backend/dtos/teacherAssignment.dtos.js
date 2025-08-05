const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const TeacherAssignmentSchema =Joi.object({
  teacher:Joi.objectId().required(),

  class:Joi.string().trim().required(),

  subject:Joi.string().trim().required(),

  semester:Joi.string().trim().required()
  
});

module.exports={TeacherAssignmentSchema};