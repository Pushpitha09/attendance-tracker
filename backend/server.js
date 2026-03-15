require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const attendanceRoutes = require('./routes/attendance');
const subjectRoutes = require('./routes/subjects');
const emailRoutes = require('./routes/email');

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/email', emailRoutes);

app.get('/', function(req, res) {
  res.send('Attendance Tracker API is running!');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, function() {
  console.log('Server running on port ' + PORT);
});