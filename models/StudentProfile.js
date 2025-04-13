// models/StudentProfile.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentProfileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  enrolledCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
  phone: String,
  address: String,
  profilePic: String // file path or URL
}, { timestamps: true });

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
