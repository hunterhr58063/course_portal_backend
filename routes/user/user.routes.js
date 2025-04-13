const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Role = require('../../models/Role');
const StudentProfile = require('../../models/StudentProfile');
const Log = require('../../models/Log')
const auth = require('../../middlewares/auth.middleware');
const checkPermission = require('../../middlewares/permission.middleware');
const bcrypt = require('bcryptjs');

// All routes below require login
router.use(auth);

// User
router.get(
    '/',
    checkPermission('view', 'user'),
    async (req, res) => {
        try {
            const users = await User.find().populate('role'); // you can populate role for clarity
            res.json(users);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

router.post(
    '/',
    checkPermission('create', 'user'),
    async (req, res) => {
        try {
            const { name, email, password, roleName } = req.body;

            const existing = await User.findOne({ email });
            if (existing) return res.status(400).json({ message: 'Email already in use' });

            const role = await Role.findOne({ name: roleName });
            if (!role) return res.status(400).json({ message: 'Role not found' });

            const hashed = await bcrypt.hash(password, 10);
            const user = new User({ name, email, password: hashed, role: role._id });
            await user.save();

            // ✅ If role is "Student", create corresponding StudentProfile
            if (roleName.toLowerCase() === 'student') {
                const profile = new StudentProfile({
                    userId: user._id,
                    enrolledCourses: [] // 
                });
                await profile.save();
            }

            // Log the action
            const log = new Log({
                user: req.user.userId, // Now req.user._id is available from the middleware
                action: 'create',
                module: 'user',
                details: `Created user ${name}`
            });

            // Save the log
            await log.save();

            res.status(201).json({ message: 'User created', user });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

// Update User
router.put(
    '/:id',
    checkPermission('update', 'user'),
    async (req, res) => {
        try {
            const { name, email, roleName } = req.body;
            const role = await Role.findOne({ name: roleName });

            const updated = await User.findByIdAndUpdate(
                req.params.id,
                { name, email, role: role?._id },
                { new: true }
            );

            // Log the action
            const log = new Log({
                user: req.user.userId, // Now req.user._id is available from the middleware
                action: 'update',
                module: 'user',
                details: `Updated user ${name}`
            });
            // Save the log
            await log.save();

            res.json(updated);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

// Delete User
router.delete(
    '/:id',
    checkPermission('delete', 'user'),
    async (req, res) => {
        try {
            const user = await User.findById(req.params.id).populate('role');

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            // ✅ If user is a student, delete corresponding student profile
            if (user.role.name.toLowerCase() === 'student') {
                await StudentProfile.findOneAndDelete({ userId: user._id });
            }

            await User.findByIdAndDelete(req.params.id);

            // Log the action
            const log = new Log({
                user: req.user.userId, // Now req.user._id is available from the middleware
                action: 'delete',
                module: 'user',
                details: `Deleted user ${user.name}`
            });
            // Save the log
            await log.save();


            res.json({ message: 'User and related profile deleted' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

module.exports = router;
