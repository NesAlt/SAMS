const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const TimetableSchema = Joi.object({
  class: Joi.string().trim().required(),

  semester: Joi.string()
    .pattern(/^Sem[1-6]$/)
    .required()
    .messages({
      "string.empty": `"semester" is required`,
      "string.pattern.base": `"semester" must be in the format 'Sem1', 'Sem2', etc.`,
    }),

  subject: Joi.string().trim().required(),

  teacher: Joi.objectId().required(),

  dayOfWeek: Joi.string()
    .valid('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday')
    .required(),

  startTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),

  endTime: Joi.string().pattern(/^([01]\d|2[0-3]):([0-5]\d)$/).required(),
});

module.exports = { TimetableSchema };
