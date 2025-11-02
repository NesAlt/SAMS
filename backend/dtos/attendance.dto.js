const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const timePattern = /^([0-1]\d|2[0-3]):([0-5]\d)$/;

const AttendanceSchema = Joi.object({
  studentId:Joi.objectId().required(),

  timetable: Joi.objectId().required(),

  date:Joi.date().required(),

  status:Joi.string()
        .valid('absent','present','on_leave','duty_leave')
        .required(),

  reason:Joi.string().max(255).optional().allow(''),

  markedBy:Joi.objectId().optional(),

   from: Joi.string().pattern(timePattern).required().messages({
    'string.pattern.base': '"from" must be in HH:mm format (e.g. 09:00)'
  }),

  to: Joi.string().pattern(timePattern).required().messages({
    'string.pattern.base': '"to" must be in HH:mm format (e.g. 10:00)'
  }),

  approvedLeave:Joi.boolean().default(false),

  category: Joi.string()
  .valid('regular_class', 'revision', 'extra')
  .default('regular_class')
});

module.exports={AttendanceSchema};