const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Role = require('../../models/Role');
const authMiddleware = require('../../middlewares/auth.middleware');
const checkPermission = require('../../middlewares/permission.middleware');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

// Register route
router.post('/register', checkPermission('create', 'user'), async (req, res) => {
  try {
    const { name, email, password, roleName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const role = await Role.findOne({ name: roleName });
    if (!role) return res.status(400).json({ message: 'Invalid role' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role._id
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
      .populate({
        path: 'role',
        populate: {
          path: 'permissions',
          model: 'Permission',
        },
      });

    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { userId: user._id, role: user.role.name },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    // ✅ Extract permissions from populated user
    const permissions = user.role.permissions.map(p => ({
      module: p.module,
      action: p.action,
    }));

    res.json({
      token,
      user: {
        name: user.name,
        role: user.role.name,
        permissions,
      },
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});


// Example Express route
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: 'role',
        populate: {
          path: 'permissions',
          model: 'Permission',
        },
      });

    if (!user) return res.status(404).json({ message: 'User not found' });
    const permissions = user.role.permissions.map(p => ({
      module: p.module,
      action: p.action,
    }));

    res.json({
      user: {
        name: user.name,
        role: user.role.name,
        permissions,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
