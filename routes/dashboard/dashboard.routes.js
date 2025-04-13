const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const Role = require('../../models/Role');
const Course = require('../../models/Course');
const StudentProfile = require('../../models/StudentProfile');
const Log = require('../../models/Log')
const auth = require('../../middlewares/auth.middleware');
// All routes below require login
router.use(auth);
// all Dashboard
router.get(
    '/admin',
    auth,
    async (req, res) => {
        try {
            const [usersCount, rolesCount, coursesCount, studentsCount, logsCount] = await Promise.all([
                User.countDocuments(),
                Role.countDocuments(),
                Course.countDocuments(),
                StudentProfile.countDocuments(),
                Log.countDocuments()
            ]);
            res.json({
                usersCount,
                rolesCount,
                coursesCount,
                studentsCount,
                logsCount
            });
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            res.status(500).json({ error: 'Failed to fetch dashboard stats' });
        }
    }
);

router.get(
    '/manager',
    auth,
    async (req, res) => {
        try {
            const [coursesCount, studentsCount] = await Promise.all([
                Course.countDocuments(),
                StudentProfile.countDocuments(),
            ]);
            res.json({
                coursesCount,
                studentsCount,
            });
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            res.status(500).json({ error: 'Failed to fetch dashboard stats' });
        }
    }
);

router.get(
    '/student',
    auth,
    async (req, res) => {
        try {
            const [coursesCount] = await Promise.all([
                Course.countDocuments(),
            ]);
            res.json({
                coursesCount
            });
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            res.status(500).json({ error: 'Failed to fetch dashboard stats' });
        }
    }
);
router.get(
    '/telecaller',
    auth,
    async (req, res) => {
        try {
            const [studentsCount] = await Promise.all([
                StudentProfile.countDocuments(),
            ]);
            res.json({
                studentsCount,

            });
        } catch (err) {
            console.error('Dashboard fetch error:', err);
            res.status(500).json({ error: 'Failed to fetch dashboard stats' });
        }
    }
);

module.exports = router;
