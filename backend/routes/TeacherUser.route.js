const express = require('express');
const router = express.Router();
const teacherController =require('../controller/TeacherUser.controller')
const { protect, isTeacher } = require('../middleware/auth.middleware');

router.get('/my_timetable', protect, isTeacher, teacherController.getAssignmentsByTeacher);
router.post('/attendance', protect, isTeacher, teacherController.markAttendance);
router.post('/attendance/bulk', protect, isTeacher, teacherController.markBulkAttendance);
router.get('/class/:className/students', protect, isTeacher, teacherController.getStudentsWithAttendance);
router.get('/classes/:semester', protect, isTeacher, teacherController.getClassesBySemester);
router.get('/class/:className/attendance-summary', protect, isTeacher, teacherController.getAttendanceSummary);
router.get('/attendance/status/:timetableId', protect, isTeacher, teacherController.getAttendanceStatus);
router.get("/upcoming/:semester", protect, isTeacher, teacherController.getUpcomingClasses);


router.get("/leaves",protect,isTeacher,teacherController.getClassLeaves);
router.put("/leaves_status/:id",protect,isTeacher,teacherController.updateLeaveStatus);

module.exports = router;
