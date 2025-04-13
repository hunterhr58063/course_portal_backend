const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Role = require('../../models/Role');
const Course = require('../../models/Course');
const StudentProfile = require('../../models/StudentProfile');
const Log = require('../../models/Log')
const auth = require('../../middlewares/auth.middleware');
const checkPermission = require('../../middlewares/permission.middleware');
const bcrypt = require('bcryptjs');
const Permission = require('../../models/Permission');

// All routes below require login
router.use(auth);

// Manage Students
router.get('/', checkPermission('view', 'student'), async (req, res) => {
  try {
    const students = await StudentProfile.find().populate('userId').populate('enrolledCourses');
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Create Student
router.post('/', checkPermission('assign', 'course'), async (req, res) => {
  try {
    const { name, email, enrolledCourses, userId } = req.body;

    const newStudent = new StudentProfile({
      name,
      email,
      enrolledCourses,
      userId,
    });

    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/create', checkPermission('create', 'student'), async (req, res) => {
  try {
    const { name, email, password, roleId, phone, address, enrolledCourses } = req.body;

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    // Create User
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role: roleId });
    await user.save();

    // Create StudentProfile
    const profile = new StudentProfile({
      userId: user._id,
      enrolledCourses,
      phone,
      address
    });
    await profile.save();

    res.status(201).json({ message: 'Student created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create student' });
  }
});
// Update Student
router.put('/:id', checkPermission('update', 'student'), async (req, res) => {
  try {
    const { name, email, enrolledCourses } = req.body;
    const student = await StudentProfile.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    student.name = name || student.name;
    student.email = email || student.email;
    student.enrolledCourses = enrolledCourses || student.enrolledCourses;

    await student.save();
    res.json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Delete Student
router.delete('/:id', checkPermission('delete', 'student'), async (req, res) => {
  try {
    const student = await StudentProfile.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
