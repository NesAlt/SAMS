const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const NotificationSchema = Joi.object({
  to: Joi.string()
    .valid('all', 'students', 'teachers', 'specific')
    .required(),

  toSpecific: Joi.alternatives().conditional('to', {
    is: 'specific',
    then: Joi.objectId().required(),
    otherwise: Joi.valid(null),
  }),

  message: Joi.string().trim().required(),

  date: Joi.date().required(),

  type: Joi.string()
    .valid('leave', 'reminder', 'announcement', 'warning')
    .required(),

  readStatus: Joi.boolean().default(false),
});

module.exports = { NotificationSchema };
