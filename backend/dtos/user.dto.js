const Joi = require('joi');

const registerUserSchema = Joi.object({
  name:Joi.string().min(3).max(30).required(),

  email:Joi.string().email().required(),

  password:Joi.string()
    .min(6)
    .max(30)
    .required(),

  role:Joi.string()
    .valid('student','teacher','admin')
    .required(),

  class:Joi.when('role',{
    is:'student',
    then:Joi.string().required(),
    otherwise:Joi.forbidden()
  }),
});

const loginUserSchema = Joi.object({
  email:Joi.string().email().lowercase().required(),
  password:Joi.string().required()
});

module.exports={registerUserSchema,loginUserSchema};