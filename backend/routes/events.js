const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

router.get('/', function(req, res) {
  db.query('SELECT * FROM events ORDER BY created_at DESC', function(err, results) {
    if(err) return res.status(500).json({ message: 'Server error' });
    res.json(results);
  });
});

router.post('/add', upload.single('poster'), function(req, res) {
  const title = req.body.title;
  const description = req.body.description;
  const event_date = req.body.event_date;
  const poster_url = req.file ? req.file.filename : null;

  db.query(
    'INSERT INTO events (title, description, event_date, poster_url) VALUES (?, ?, ?, ?)',
    [title, description, event_date, poster_url],
    function(err, results) {
      if(err) return res.status(500).json({ message: 'Error adding event' });

      db.query('SELECT email, name FROM students', function(err2, students) {
        if(err2) return res.json({ message: 'Event added but email failed!' });

        students.forEach(function(student) {
          const mailOptions = {
            from: process.env.EMAIL_USER,
            to: student.email,
            subject: 'New Event: ' + title + ' - RGMCET',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="background: linear-gradient(135deg, #1a73e8, #0d47a1); padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
                  <h1 style="color: white; margin: 0;">RGMCET</h1>
                  <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0;">Department of Computer Science & Engineering</p>
                </div>
                <h2 style="color: #1a73e8;">New Event Announced!</h2>
                <p>Dear <strong>${student.name}</strong>,</p>
                <p>A new event has been announced. Here are the details:</p>
                <div style="background: #f0f4ff; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #1a73e8;">
                  <h3 style="margin: 0; color: #1a73e8;">${title}</h3>
                  <p style="margin: 8px 0 0;">${description}</p>
                  <p style="margin: 8px 0 0;"><strong>Date:</strong> ${new Date(event_date).toDateString()}</p>
                </div>
                <p>Login to the Student Portal to view the event poster and RSVP!</p>
                <p>Regards,<br><strong>RGMCET Attendance System</strong></p>
              </div>
            `
          };
          transporter.sendMail(mailOptions, function(err) {
            if(err) console.log('Email error:', err);
          });
        });

        res.json({ message: 'Event added and notifications sent!', id: results.insertId });
      });
    }
  );
});

router.delete('/delete/:id', function(req, res) {
  db.query('DELETE FROM rsvp WHERE event_id = ?', [req.params.id], function(err) {
    db.query('DELETE FROM events WHERE id = ?', [req.params.id], function(err2) {
      if(err2) return res.status(500).json({ message: 'Server error' });
      res.json({ message: 'Event deleted successfully!' });
    });
  });
});

router.post('/rsvp', function(req, res) {
  const event_id = req.body.event_id;
  const student_id = req.body.student_id;
  const status = req.body.status;

  db.query(
    'SELECT * FROM rsvp WHERE event_id = ? AND student_id = ?',
    [event_id, student_id],
    function(err, results) {
      if(err) return res.status(500).json({ message: 'Server error' });

      if(results.length > 0) {
        db.query(
          'UPDATE rsvp SET status = ? WHERE event_id = ? AND student_id = ?',
          [status, event_id, student_id],
          function(err2) {
            if(err2) return res.status(500).json({ message: 'Server error' });
            res.json({ message: 'RSVP updated!' });
          }
        );
      } else {
        db.query(
          'INSERT INTO rsvp (event_id, student_id, status) VALUES (?, ?, ?)',
          [event_id, student_id, status],
          function(err2) {
            if(err2) return res.status(500).json({ message: 'Server error' });
            res.json({ message: 'RSVP saved!' });
          }
        );
      }
    }
  );
});

router.get('/rsvp/:event_id', function(req, res) {
  db.query(
    'SELECT COUNT(*) as attending FROM rsvp WHERE event_id = ? AND status = ?',
    [req.params.event_id, 'attending'],
    function(err, results) {
      if(err) return res.status(500).json({ message: 'Server error' });
      res.json(results[0]);
    }
  );
});

router.get('/rsvp/:event_id/:student_id', function(req, res) {
  db.query(
    'SELECT * FROM rsvp WHERE event_id = ? AND student_id = ?',
    [req.params.event_id, req.params.student_id],
    function(err, results) {
      if(err) return res.status(500).json({ message: 'Server error' });
      res.json(results[0] || null);
    }
  );
});

module.exports = router;
