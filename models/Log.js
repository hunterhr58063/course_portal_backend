const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const logSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // e.g., 'create', 'update', 'delete'
    module: { type: String, required: true }, // e.g., 'user', 'course', 'student'
    details: { type: String, required: true }, // Additional details (e.g., 'created user John Doe')
    timestamp: { type: Date, default: Date.now } // Automatically set the timestamp
}, { timestamps: true });

module.exports = mongoose.model('Log', logSchema);
