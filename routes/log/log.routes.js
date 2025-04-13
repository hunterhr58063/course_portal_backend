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

router.get('/', checkPermission('view', 'logs'), async (req, res) => {
    try {
        const logs = await Log.find().sort({ timestamp: -1 }).populate('user', 'name email');
        res.json(logs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;
