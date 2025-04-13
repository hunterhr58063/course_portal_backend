// models/Course.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  duration: String // e.g., '4 weeks'
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
