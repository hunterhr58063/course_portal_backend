// models/Permission.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const permissionSchema = new Schema({
  action: { type: String, required: true }, // e.g., 'create', 'update', 'delete'
  module: { type: String, required: true }  // e.g., 'user', 'course', 'student'
});

module.exports = mongoose.model('Permission', permissionSchema);
