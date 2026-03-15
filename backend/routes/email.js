const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const db = require('../db');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

router.post('/send-warning', function(req, res) {
  db.query('SELECT * FROM students WHERE attendance_percentage < 75', function(err, students) {
    if(err) return res.status(500).json({ message: 'Server error' });
    if(students.length === 0) return res.json({ message: 'No students with low attendance!' });

    let sent = 0;

    students.forEach(function(student) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: student.email,
        subject: 'Low Attendance Warning - RGMCET',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="background: linear-gradient(135deg, #1a73e8, #0d47a1); padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0;">RGMCET</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">Department of Computer Science & Engineering</p>
            </div>

            <h2 style="color: #ea4335;">Low Attendance Warning</h2>
            <p>Dear <strong>${student.name}</strong>,</p>
            <p>This is to inform you that your attendance is below the required <strong>75%</strong> threshold.</p>

            <div style="background: #fce8e6; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ea4335;">
              <p style="margin: 0;"><strong>Roll No:</strong> ${student.roll_no}</p>
              <p style="margin: 8px 0 0;"><strong>Current Attendance:</strong> ${student.attendance_percentage}%</p>
              <p style="margin: 8px 0 0;"><strong>Required Attendance:</strong> 75%</p>
              <p style="margin: 8px 0 0;"><strong>Shortage:</strong> ${(75 - student.attendance_percentage).toFixed(2)}%</p>
            </div>

            <p>Please ensure you attend all upcoming classes to improve your attendance percentage and maintain eligibility for examinations.</p>

            <div style="background: #f0f4ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #1a73e8;"><strong>Note:</strong> Students with attendance below 75% may not be eligible to appear in the final examinations.</p>
            </div>

            <p>For any queries, please contact your faculty.</p>
            <p>Regards,<br><strong>RGMCET Attendance System</strong><br>Department of CSE</p>
          </div>
        `
      };

      transporter.sendMail(mailOptions, function(err) {
        if(!err) sent++;
      });
    });

    res.json({ message: 'Warning emails sent to ' + students.length + ' students!' });
  });
});

router.post('/send-summary', function(req, res) {
  db.query('SELECT * FROM students', function(err, students) {
    if(err) return res.status(500).json({ message: 'Server error' });
    if(students.length === 0) return res.json({ message: 'No students found!' });

    students.forEach(function(student) {
      const status = student.attendance_percentage >= 75 ? 'Eligible' : student.attendance_percentage >= 60 ? 'Warning' : 'Not Eligible';
      const statusColor = student.attendance_percentage >= 75 ? '#34a853' : student.attendance_percentage >= 60 ? '#f9ab00' : '#ea4335';

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: student.email,
        subject: 'Monthly Attendance Summary - RGMCET',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <div style="background: linear-gradient(135deg, #1a73e8, #0d47a1); padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0;">RGMCET</h1>
              <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">Department of Computer Science & Engineering</p>
            </div>

            <h2 style="color: #1a73e8;">Monthly Attendance Summary</h2>
            <p>Dear <strong>${student.name}</strong>,</p>
            <p>Here is your attendance summary for this month:</p>

            <div style="background: #f0f4ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1a73e8;">
              <p style="margin: 0;"><strong>Roll No:</strong> ${student.roll_no}</p>
              <p style="margin: 8px 0 0;"><strong>Attendance:</strong> ${student.attendance_percentage}%</p>
              <p style="margin: 8px 0 0;"><strong>Mid 1 Marks:</strong> ${student.mid1}/20</p>
              <p style="margin: 8px 0 0;"><strong>Mid 2 Marks:</strong> ${student.mid2}/20</p>
              <p style="margin: 8px 0 0;"><strong>Assignment:</strong> ${student.assignment}/10</p>
              <p style="margin: 8px 0 0;"><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${status}</span></p>
            </div>

            <p>Keep up the good work and maintain your attendance above 75% to stay eligible for examinations.</p>
            <p>Regards,<br><strong>RGMCET Attendance System</strong><br>Department of CSE</p>
          </div>
        `
      };

      transporter.sendMail(mailOptions, function(err) {
        if(err) console.log('Error sending to ' + student.email + ':', err);
      });
    });

    res.json({ message: 'Monthly summary sent to ' + students.length + ' students!' });
  });
});

module.exports = router;