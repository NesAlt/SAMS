const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const AttendanceSchema = Joi.object({
  studentId:Joi.objectId().required(),

  teacherAssignment: Joi.objectId().required(),

  date:Joi.date().required(),

  status:Joi.string()
        .valid('absent','present','on_leave','duty_leave')
        .required(),

  reason:Joi.string().max(255).optional().allow(''),

  markedBy:Joi.objectId().required(),
  
  approvedLeave:Joi.boolean().default(false)
});

module.exports={AttendanceSchema};