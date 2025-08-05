const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const LeaveSchema = Joi.object({

studentId:Joi.objectId().required(),

fromDate:Joi.date().required(),

toDate:Joi.date()
      .min(Joi.ref('fromDate')).required()
      .message({'fromDate.min':'toDate must be greater than fromDate'}),

reason:Joi.string().trim().required(),

status:Joi.string()
      .valid('pending','approved','denied').required(),

reviewdBy:Joi.objectId().required(),

appliedAt:Joi.date().default(()=> new Date())

});
module.exports={LeaveSchema}