const express = require('express');
const router = express.Router();
const { protect, isAdmin, isTeacher } = require('../middleware/auth.middleware');
const notificationController = require('../controller/Notifications.controller');

router.post('/', protect,notificationController.createNotification);

router.get('/', protect, notificationController.getMyNotifications);

router.put('/:id/read', protect, notificationController.markAsRead);

module.exports = router;
