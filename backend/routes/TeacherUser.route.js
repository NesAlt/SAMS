const express = require('express');
const router = express.Router();
const teacherController =require('../controller/TeacherUser.controller')
const { protect, isTeacher } = require('../middleware/auth.middleware');

router.get('/my_assignments', protect, isTeacher, teacherController.getAssignmentsByTeacher);
router.post('/attendance', protect, isTeacher, teacherController.markAttendance);
router.post('/attendance/bulk', protect, isTeacher, teacherController.markBulkAttendance);
router.get('/class/:className/students', protect, isTeacher, teacherController.getStudentsWithAttendance);

router.get("/leaves",protect,isTeacher,teacherController.getClassLeaves);
router.put("/leaves_status/:id",protect,isTeacher,teacherController.updateLeaveStatus);

module.exports = router;
