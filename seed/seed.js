// seed/seed.js
const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('../config/db');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

const seed = async () => {
  try {
    await connectDB();

    const permissionsData = [
      { action: 'create', module: 'user' },
      { action: 'update', module: 'user' },
      { action: 'delete', module: 'user' },
      { action: 'view', module: 'user' },
      { action: 'view', module: 'roles' },
      { action: 'update', module: 'roles' },
      { action: 'view', module: 'student' },
      { action: 'create', module: 'student' },
      { action: 'update', module: 'student' },
      { action: 'delete', module: 'student' },
      { action: 'create', module: 'course' },
      { action: 'update', module: 'course' },
      { action: 'view', module: 'course' },
      { action: 'delete', module: 'course' },
      { action: 'enroll', module: 'course' },
      { action: 'assign', module: 'course' },
      { action: 'view', module: 'logs' },
    ];

    const insertedPermissions = await Permission.insertMany(permissionsData);

    const roles = [
      {
        name: 'Admin',
        permissions: insertedPermissions.map(p => p._id)
      },
      {
        name: 'Manager',
        permissions: insertedPermissions.filter(p => ['view', 'manage'].includes(p.action)).map(p => p._id)
      },
      {
        name: 'Telecaller',
        permissions: insertedPermissions.filter(p => ['create', 'assign'].includes(p.action)).map(p => p._id)
      },
      {
        name: 'Student',
        permissions: insertedPermissions.filter(p => ['enroll'].includes(p.action)).map(p => p._id)
      },
    ];

    await Role.insertMany(roles);

    console.log('✅ Seeding complete!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    process.exit();
  }
};

seed();

