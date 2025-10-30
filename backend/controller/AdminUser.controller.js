const { Readable } = require('stream');
const csv = require('csv-parser');
const User = require('../models/User');
const Attendance = require("../models/Attendance");
const { registerUserSchema } = require('../dtos/user.dto');
const TeacherAssignment = require('../models/TeacherAssignment');
const { TeacherAssignmentSchema } = require('../dtos/teacherAssignment.dtos');
const Event = require('../models/Event');
const { EventSchema } = require('../dtos/event.dto');
const { WorkingDaysSchema } = require("../dtos/workingDays.dto");
const WorkingDays = require("../models/WorkingDays");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    const studentCount = await User.countDocuments({ role: 'student' });
    const teacherCount = await User.countDocuments({ role: 'teacher' });

    res.json({
      total: users.length,
      students: studentCount,
      teachers: teacherCount,
      users
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.uploadUsers = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'CSV file is required' });
  }

  const results = [];
  const errors = [];
  const validUsers = [];

  const stream = Readable.from(req.file.buffer);

  stream
    .pipe(csv())
    .on('data', (row) => results.push(row))
    .on('end', async () => {
      for (let i = 0; i < results.length; i++) {
        const row = results[i];

        const userData = {
          name: row.name,
          email: row.email,
          password: row.password,
          role: row.role,
        };

        if (row.role === 'student') {
          userData.class = row.class;
        }

        const { error, value } = registerUserSchema.validate(userData);

        if (error) {
          errors.push({
            row: i + 1,
            message: error.details[0].message,
            rowData: row,
          });
          continue;
        }

        validUsers.push(value);
      }

      let insertedCount = 0;

      try {
        if (validUsers.length > 0) {
          const inserted = await User.insertMany(validUsers,{ordered:false});
          insertedCount = inserted.length;
        }
      } catch (err) {
        errors.push({ row: 'bulk', message: err.message });
      }

      res.json({
        total: results.length,
        successful: insertedCount,
        failed: errors.length,
        errors,
      });
    });
};

exports.addUser = async (req, res) => {
  const { error, value } = registerUserSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  try {
    const user = await User.create(value);
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  console.log("Updating user with ID:", id);
  console.log("Update data:", req.body);

  try {
    if ('password' in req.body) {
      delete req.body.password;
    }
    if (req.body.email) {
      const emailExists = await User.findOne({ email: req.body.email, _id: { $ne: id } });
      if (emailExists) {
        return res.status(400).json({ error: "Email already in use by another user" });
      }
    }
    const updatedUser = await User.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllAssignments = async (req, res) => {
  try {
    const assignments = await TeacherAssignment.find()
      .populate('teacher', 'name email')
      .sort({ createdAt: -1 });

    res.json(assignments);
  } catch (err) {
    res.status(500).json({ error: 'Server Error during Get Teachers' });
  }
};

exports.addAssignment = async (req, res) => {
  try {
    const { error } = TeacherAssignmentSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { teacher, class: className, subject, semester } = req.body;

    const teacherExists = await User.findById(teacher);
    if (!teacherExists || teacherExists.role !== 'teacher') {
      return res.status(400).json({ error: 'Invalid Teacher ID' });
    }

    const existing = await TeacherAssignment.findOne({
      teacher,
      class: className,
      subject,
      semester,
    });

    if (existing) {
      return res.status(400).json({ error: 'Assignment already exists for this teacher' });
    }

    let newAssignment = await TeacherAssignment.create({
      teacher,
      class: className,
      subject,
      semester,
    });

    newAssignment = await newAssignment.populate('teacher','name email');

    res.status(201).json(newAssignment);
  } catch (err) {
    res.status(500).json({ error: 'Server issue with adding assignment' });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await TeacherAssignment.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate('teacher','name email');

    if (!updated) return res.status(404).json({ error: 'Assignment not found' });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Server error with updating assignment' });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await TeacherAssignment.findByIdAndDelete(id);

    if (!deleted) return res.status(404).json({ error: 'Assignment not found' });

    res.json({ message: 'Assignment deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server issue while deleting assignment' });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const adminId = req.user.id;

    const { error, value } = EventSchema.validate({ ...req.body, createdBy: adminId });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const event = new Event(value);
    await event.save();

    res.status(201).json({ message: "Event created successfully", event });
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ error: "Server error while creating event" });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({ error: "Server error while fetching events" });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEvent = await Event.findByIdAndDelete(id);
    if (!deletedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).json({ error: "Server error while deleting event" });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = EventSchema.validate(req.body, { allowUnknown: true });
    if (error) return res.status(400).json({ error: error.details[0].message });

    const updatedEvent = await Event.findByIdAndUpdate(id, value, { new: true });
    if (!updatedEvent) return res.status(404).json({ error: "Event not found" });

    res.json({ message: "Event updated successfully", updatedEvent });
  } catch (err) {
    console.error("Error updating event:", err);
    res.status(500).json({ error: "Server error while updating event" });
  }
};

exports.setWorkingDays = async (req, res) => {
  try {
    const { error, value } = WorkingDaysSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { semester, totalWorkingDays } = value;

    const existing = await WorkingDays.findOne({ semester });
    if (existing) {
      return res.status(400).json({ message: "Working days for this semester already set." });
    }

    const record = new WorkingDays({
      semester,
      totalWorkingDays,
      createdBy: req.user._id,
    });
    await record.save();

    res.status(201).json({
      message: "Working days set successfully.",
      data: record,
    });
  } catch (err) {
    console.error("Error setting working days:", err);
    res.status(500).json({ message: "Server error while setting working days." });
  }
};

exports.getWorkingDays = async (req, res) => {
  try {
    const records = await WorkingDays.find().populate('createdBy', 'name email role');
    res.status(200).json(records);
  } catch (err) {
    console.error("Error fetching working days:", err);
    res.status(500).json({ message: "Server error while fetching working days." });
  }
};

exports.updateWorkingDays = async (req, res) => {
  try {
    const { semester } = req.params;
    const { totalWorkingDays } = req.body;

    const record = await WorkingDays.findOneAndUpdate(
      { semester },
      { totalWorkingDays },
      { new: true }
    );

    if (!record)
      return res.status(404).json({ message: "Semester not found." });

    res.status(200).json({
      message: "Working days updated successfully.",
      data: record,
    });

  } catch (err) {
    console.error("Error updating working days:", err);
    res.status(500).json({ message: "Server error while updating working days." });
  }
};

exports.getAllClasses = async (req, res) => {
  try {
    const classes = await User.distinct("class", { role: "student" });
    if (!classes.length) {
      return res.json({ message: "No classes found." });
    }
    res.json({ classes });
  } catch (err) {
    console.error("Error fetching classes:", err);
    res.status(500).json({ message: "Server error fetching classes." });
  }
};

exports.getMonthlyReport = async (req, res) => {
  try {
    const { className, month, year } = req.params;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendanceRecords = await Attendance.find({
      date: { $gte: startDate, $lte: endDate },
    })
      .populate("studentId", "name class role")
      .populate("teacherAssignment", "subject")
      .lean();

    const filtered = attendanceRecords.filter(
      (r) => r.studentId?.class === className
    );

    if (!filtered.length) {
      return res.json({ message: "No attendance data found for this class in the selected month." });
    }

    // Group by student → subject
    const studentReports = {};

    filtered.forEach((rec) => {
      const studentName = rec.studentId?.name || "Unknown";
      const subject = rec.teacherAssignment?.subject || "Unknown";

      if (!studentReports[studentName]) studentReports[studentName] = {};
      if (!studentReports[studentName][subject])
        studentReports[studentName][subject] = { total: 0, present: 0 };

      studentReports[studentName][subject].total++;
      if (rec.status === "present") studentReports[studentName][subject].present++;
    });

    // Convert to array (per subject)
    const report = [];
    for (const [studentName, subjects] of Object.entries(studentReports)) {
      for (const [subject, data] of Object.entries(subjects)) {
        const percentage = Math.round((data.present / data.total) * 100);
        report.push({
          studentName,
          subject,
          presentDays: data.present,
          totalDays: data.total,
          percentage
        });
      }
    }

    res.json({ className, month: parseInt(month), year: parseInt(year), report });
  } catch (err) {
    console.error("Error generating monthly report:", err);
    res.status(500).json({ message: "Server error generating monthly report." });
  }
};

exports.getSemesterReport = async (req, res) => {
  try {
    let { className, semester } = req.params;
    if (!semester.startsWith("Sem")) semester = `Sem${semester}`;

    const assignments = await TeacherAssignment.find({ class: className, semester })
      .select("_id subject");

    if (!assignments.length) {
      return res.json({ message: "No subjects found for this class and semester." });
    }

    const attendanceRecords = await Attendance.find({
      teacherAssignment: { $in: assignments.map((a) => a._id) },
    })
      .populate("studentId", "name class role")
      .lean();

    if (!attendanceRecords.length) {
      return res.json({ message: "No attendance data found for this semester." });
    }

    const subjectMap = {};
    assignments.forEach((a) => (subjectMap[a._id.toString()] = a.subject));

    const studentReports = {};

    attendanceRecords.forEach((rec) => {
      const studentName = rec.studentId?.name || "Unknown";
      const subject = subjectMap[rec.teacherAssignment?.toString()] || "Unknown";

      if (!studentReports[studentName]) studentReports[studentName] = {};
      if (!studentReports[studentName][subject])
        studentReports[studentName][subject] = { total: 0, present: 0 };

      studentReports[studentName][subject].total++;
      if (rec.status === "present") studentReports[studentName][subject].present++;
    });

    const report = [];
    for (const [studentName, subjects] of Object.entries(studentReports)) {
      for (const [subject, data] of Object.entries(subjects)) {
        const percentage = Math.round((data.present / data.total) * 100);
        report.push({
          studentName,
          subject,
          presentDays: data.present,
          totalDays: data.total,
          percentage
        });
      }
    }

    res.json({ className, semester, report });
  } catch (err) {
    console.error("Error generating semester report:", err);
    res.status(500).json({ message: "Server error generating semester report." });
  }
};
