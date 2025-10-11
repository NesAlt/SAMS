const { Readable } = require('stream');
const csv = require('csv-parser');
const User = require('../models/User');
const { registerUserSchema } = require('../dtos/user.dto');

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


;