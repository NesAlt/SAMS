const express = require('express');
const router = express.Router();
const adminController = require('../controller/AdminUser.controller');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/get-all-users',adminController.getAllUsers);

router.post('/upload-users', upload.single('file'), adminController.uploadUsers);
router.post('/add-user',adminController.addUser);

router.put('/update-user/:id',adminController.updateUser);

router.delete('/delete-user/:id',adminController.deleteUser);

module.exports = router;
