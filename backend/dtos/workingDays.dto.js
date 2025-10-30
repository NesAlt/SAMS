const Joi = require("joi");
Joi.objectId = require("joi-objectid")(Joi);

const WorkingDaysSchema = Joi.object({
  semester: Joi.string()
    .pattern(/^Sem[1-6]$/)
    .required()
    .messages({
      "string.empty": `"semester" is required`,
      "string.pattern.base": `"semester" must be in the format 'Sem1', 'Sem2', etc.`,
    }),

  totalWorkingDays: Joi.number()
    .integer()
    .min(1)
    .max(200)
    .required()
    .messages({
      "number.base": `"totalWorkingDays" must be a number`,
      "number.min": `"totalWorkingDays" must be at least 1`,
      "number.max": `"totalWorkingDays" cannot exceed 200`,
    }),

  createdBy: Joi.objectId().optional(),

  createdAt: Joi.date().optional().default(Date.now),
});

module.exports = { WorkingDaysSchema };