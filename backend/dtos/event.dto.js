const Joi =require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const EventSchema =Joi.object({
  title:Joi.string().trim().required(),

  description:Joi.string().trim().allow(''),

date: Joi.date().min('now').required()
  .messages({ 'date.min': 'Date cannot be in the past' }),
  
  endDate:Joi.date().min(Joi.ref('date'))
          .message({'date.min':'endDate must be larger than or equal to date'}),

  type:Joi.string()
      .valid('holiday','event')
      .required(),

  createdBy:Joi.objectId().required(),
});

module.exports={EventSchema};