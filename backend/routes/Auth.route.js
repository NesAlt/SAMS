const express = require('express');
const router = express.Router();
const { login, register } = require('../controller/Auth.controller');
const { loginUserSchema, registerUserSchema } = require('../dtos/user.dto');

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

router.post('/register', validate(registerUserSchema), register);
router.post('/login', validate(loginUserSchema), login);

module.exports = router;
