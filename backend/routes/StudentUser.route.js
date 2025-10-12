const express = require("express");
const router = express.Router();
const { protect, isStudent } = require("../middleware/auth.middleware");
const studentController = require("../controller/StudentUser.controller");

// GET attendance of logged-in student
router.get("/attendance", protect, isStudent, studentController.getMyAttendance);

module.exports = router;
