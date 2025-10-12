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

router.get('/all', protect, isAdmin, adminController.getAllAssignments);
router.post('/add', protect, isAdmin, adminController.addAssignment);
router.put('/update/:id', protect, isAdmin, adminController.updateAssignment);
router.delete('/delete/:id', protect, isAdmin, adminController.deleteAssignment); 



module.exports = router;
