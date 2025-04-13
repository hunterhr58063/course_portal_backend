// app.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Import routes
app.use('/api/auth', require('./routes/auth/auth.routes'));
app.use('/api/dashboard', require('./routes/dashboard/dashboard.routes'))
app.use('/api/users', require('./routes/user/user.routes'))
app.use('/api/courses', require('./routes/coures/coures.routes'))
app.use('/api/students', require('./routes/student/student.routes'));
app.use('/api/roles', require('./routes/role/role.routes'));
app.use('/api/logs', require('./routes/log/log.routes'));


module.exports = app;
