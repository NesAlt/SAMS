const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const LeaveSchema = Joi.object({

studentId:Joi.objectId().required(),

fromDate:Joi.date().required(),

toDate:Joi.date()
      .min(Joi.ref('fromDate')).required()
      .messages({'fromDate.min':'toDate must be greater than fromDate'}),

reason:Joi.string().trim().required(),

status:Joi.string()
      .valid('pending','approved','denied','duty_leave').default('pending'),

reviewedBy:Joi.objectId().allow(null),

appliedAt:Joi.date().default(()=> new Date())

});
module.exports={LeaveSchema}