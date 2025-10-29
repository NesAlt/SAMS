const express = require("express");
const router = express.Router();
const { protect, isStudent } = require("../middleware/auth.middleware");
const studentController = require("../controller/StudentUser.controller");

// GET attendance of logged-in student
router.get("/attendance", protect, isStudent, studentController.getMyAttendance);

router.get("/leaves",protect,isStudent,studentController.getMyLeaves);
router.post("/send_leave",protect,isStudent,studentController.applyLeave);
router.delete("/cancel_leave/:id",protect,isStudent,studentController.deleteLeave);
router.get("/get_events",protect,isStudent,studentController.getAllEventsForStudents)
module.exports = router;
