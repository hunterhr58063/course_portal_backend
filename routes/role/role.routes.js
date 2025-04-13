const express = require('express');
const router = express.Router();
const Role = require('../../models/Role');
const Log = require('../../models/Log')
const auth = require('../../middlewares/auth.middleware');
const checkPermission = require('../../middlewares/permission.middleware');
const Permission = require('../../models/Permission');

// All routes below require login
router.use(auth);

// Get all roles with permissions
router.get('/', checkPermission('view', 'roles'), async (req, res) => {
    try {

        const roles = await Role.find().populate('permissions');
        res.json(roles);
    } catch (err) {
        res.status(500).json({ error: err.message });

    }
});
// Get all available permissions
router.get('/permissions', checkPermission('view', 'roles'), async (req, res) => {
    try {
        const permissions = await Permission.find();
        res.json(permissions);
    } catch (err) {
        res.status(500).json({ error: err.message });

    }
});
// Update role permissions
router.put('/:roleName', checkPermission('update', 'roles'), async (req, res) => {
    try {
        const { permissions } = req.body; // Array of permission IDs

        const updatedRole = await Role.findOneAndUpdate(
            { name: req.params.roleName },
            { permissions },
            { new: true }
        ).populate('permissions');

        if (!updatedRole) return res.status(404).json({ message: 'Role not found' });

        // Log the action
        const log = new Log({
            user: req.user.userId, // Now req.user._id is available from the middleware
            action: 'update',
            module: 'roles',
            details: `updated roles ${req.params.roleName}`
        });
        // Save the log
        await log.save();

        res.json(updatedRole);
    } catch (err) {
        console.log(err)
        res.status(500).json({ error: err.message });

    }
});


module.exports = router;
