const express = require('express');
const router = express.Router();
const adminController = require('../controller/AdminUser.controller');
const multer = require('multer');
const { protect,isAdmin } = require('../middleware/auth.middleware');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/get-all-users', protect, isAdmin, adminController.getAllUsers);
router.post('/upload-users', protect ,isAdmin, upload.single('file'), adminController.uploadUsers);
router.post('/add-user', protect, isAdmin, adminController.addUser);
router.put('/update-user/:id', protect ,isAdmin, adminController.updateUser);
router.delete('/delete-user/:id', protect ,isAdmin, adminController.deleteUser);

// router.get('/all', protect, isAdmin, adminController.getAllAssignments);
// router.post('/add', protect, isAdmin, adminController.addAssignment);
// router.put('/update/:id', protect, isAdmin, adminController.updateAssignment);
// router.delete('/delete/:id', protect, isAdmin, adminController.deleteAssignment); 

router.post('/event_add',protect,isAdmin,adminController.createEvent);
router.get('/get_events',protect,isAdmin,adminController.getAllEvents);
router.delete('/del_event/:id',protect,isAdmin,adminController.deleteEvent);
router.put('/update_event/:id',protect,isAdmin,adminController.updateEvent);

router.post('/total_sessions',protect,isAdmin,adminController.setTotalSessions);
router.get('/fetch_total_sessions',protect,isAdmin,adminController.getTotalSessions);
router.put('/update_total_sessions/:semester',protect,isAdmin,adminController.updateTotalSessions);

router.get("/classes", protect,isAdmin, adminController.getAllClasses);
router.get("/reports/monthly/:className/:month/:year", protect,isAdmin, adminController.getMonthlyReport);
router.get("/reports/semester/:className/:semester", protect,isAdmin, adminController.getSemesterReport);

router.post('/timetableAdd', protect, isAdmin, adminController.addTimetableEntry);
router.get('/timetable/:className/:semester', protect, isAdmin, adminController.getTimetableByClass);
router.delete('/timetable/:id', protect, isAdmin, adminController.deleteTimetableEntry);

module.exports = router;