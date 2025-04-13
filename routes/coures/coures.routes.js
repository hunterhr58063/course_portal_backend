const express = require('express');
const router = express.Router();
const Course = require('../../models/Course');
const Log = require('../../models/Log')
const auth = require('../../middlewares/auth.middleware');
const checkPermission = require('../../middlewares/permission.middleware');
const StudentProfile = require('../../models/StudentProfile');
// All routes below require login
router.use(auth);

// Manage Courses
router.get('/', checkPermission('view', 'course'), async (req, res) => {
    try {
        const course = await Course.find()
        res.json(course);
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err.message });
    }
});
router.post('/', checkPermission('create', 'course'), async (req, res) => {
    try {
        const course = await Course.create(req.body);

        // Log the action
        const log = new Log({
            user: req.user.userId, // Now req.user._id is available from the middleware
            action: 'create',
            module: 'course',
            details: `created course ${course.title}`
        });
        // Save the log
        await log.save();

        res.status(201).json(course);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', checkPermission('update', 'course'), async (req, res) => {
    try {
        const updated = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        // Log the action
        const log = new Log({
            user: req.user.userId, // Now req.user._id is available from the middleware
            action: 'update',
            module: 'course',
            details: `updated course ${req.body.title}`
        });
        // Save the log
        await log.save();

        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', checkPermission('delete', 'course'), async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);


        // Log the action
        const log = new Log({
            user: req.user.userId, // Now req.user._id is available from the middleware
            action: 'update',
            module: 'course',
            details: `updated course ${course.title}`
        });
        // Save the log
        await log.save();

        res.json({ message: 'Course deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/enroll', checkPermission('enroll', 'course'), async (req, res) => {
    const { courseId } = req.body;
    const userId = req.user.userId;
    try {
        const profile = await StudentProfile.findOne({ userId });
        if (!profile) return res.status(404).json({ message: 'Student profile not found' });

        if (profile.enrolledCourses.includes(courseId)) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        profile.enrolledCourses.push(courseId);
        await profile.save();

        res.status(200).json({ message: 'Enrolled successfully' });
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: 'Enrollment failed' });
    }
});



module.exports = router;
