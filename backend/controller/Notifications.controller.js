const Notification = require('../models/Notification');
const User = require('../models/User');

exports.createNotification = async (req, res) => {
  try {
    const { to, toSpecific, message, type } = req.body;
    const senderRole = req.user.role;

    if (senderRole === 'teacher' && to === 'all') {
      return res.status(403).json({ message: "Teachers can't send to all users." });
    }

    if (senderRole !== 'admin' && ['teachers', 'students'].includes(to) && !toSpecific) {
      return res.status(403).json({ message: "Only admin can broadcast to all teachers or students." });
    }

    const baseNotification = {
      to,
      toSpecific: toSpecific || null,
      message,
      type,
      date: new Date()
    };

    let notificationsToCreate = [];

    if (to === 'all') {
      const allUsers = await User.find({}, '_id');
      notificationsToCreate = allUsers.map(u => ({
        ...baseNotification,
        to: 'specific',
        toSpecific: u._id
      }));
    } 
    else if (to === 'teachers') {
      const teachers = await User.find({ role: 'teacher' }, '_id');
      notificationsToCreate = teachers.map(t => ({
        ...baseNotification,
        to: 'specific',
        toSpecific: t._id
      }));
    } 
    else if (to === 'students') {
      const students = await User.find({ role: 'student' }, '_id');
      notificationsToCreate = students.map(s => ({
        ...baseNotification,
        to: 'specific',
        toSpecific: s._id
      }));
    } 
    else if (to === 'specific' && toSpecific) {
      notificationsToCreate.push(baseNotification);
    } 
    else {
      return res.status(400).json({ message: "Invalid notification target." });
    }

    const savedNotifications = await Notification.insertMany(notificationsToCreate);

    res.status(201).json({
      message: "Notifications sent successfully.",
      count: savedNotifications.length
    });
  } catch (err) {
    console.error("Error creating notification:", err);
    res.status(500).json({ message: "Server error while sending notification." });
  }
};


exports.getMyNotifications = async (req, res) => {
  try {
    const { id, role } = req.user;

    const notifications = await Notification.find({
      $or: [
        { to: 'all' },
        { to: role },
        { to: 'specific', toSpecific: id }
      ]
    }).sort({ createdAt: -1 });

    res.json({ notifications });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ message: "Server error fetching notifications." });
  }
};


exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { readStatus: true });
    res.json({ message: "Notification marked as read." });
  } catch (err) {
    console.error("Error updating notification:", err);
    res.status(500).json({ message: "Server error marking notification as read." });
  }
};
