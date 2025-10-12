const express = require('express');
const router = express.Router();
const teacherController =require('../controller/TeacherUser.controller')
const { protect, isTeacher } = require('../middleware/auth.middleware');

router.get('/my-assignments', protect, isTeacher, teacherController.getAssignmentsByTeacher);
router.post('/attendance', protect, isTeacher, teacherController.markAttendance);
router.get('/class/:className/students', protect, isTeacher, teacherController.getStudentsWithAttendance);

module.exports = router;
