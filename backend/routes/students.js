const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');

router.get('/', function(req, res) {
  db.query('SELECT * FROM students', function(err, results) {
    if(err) return res.status(500).json({ message: 'Server error' });
    res.json(results);
  });
});

router.post('/add', function(req, res) {
  const roll_no = req.body.roll_no;
  const name = req.body.name;
  const email = req.body.email;
  const attendance_percentage = req.body.attendance_percentage;
  const mid1 = req.body.mid1;
  const mid2 = req.body.mid2;
  const assignment = req.body.assignment;

  db.query(
    'INSERT INTO students (roll_no, name, email, attendance_percentage, mid1, mid2, assignment) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [roll_no, name, email, attendance_percentage, mid1, mid2, assignment],
    function(err, results) {
      if(err) return res.status(500).json({ message: 'Error adding student', error: err });

      const hashedPassword = bcrypt.hashSync(roll_no, 10);
      db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hashedPassword, 'student'],
        function(err2) {
          if(err2) return res.status(500).json({ message: 'Error creating student login', error: err2 });
          res.json({ message: 'Student added successfully', id: results.insertId });
        }
      );
    }
  );
});

router.delete('/delete/:id', function(req, res) {
  db.query('SELECT email FROM students WHERE id = ?', [req.params.id], function(err, results) {
    if(err) return res.status(500).json({ message: 'Server error' });
    if(results.length === 0) return res.status(404).json({ message: 'Student not found' });

    const email = results[0].email;

    db.query('DELETE FROM students WHERE id = ?', [req.params.id], function(err2) {
      if(err2) return res.status(500).json({ message: 'Server error' });

      db.query('DELETE FROM users WHERE email = ? AND role = ?', [email, 'student'], function(err3) {
        if(err3) return res.status(500).json({ message: 'Server error' });
        res.json({ message: 'Student deleted successfully' });
      });
    });
  });
});

router.put('/update/:id', function(req, res) {
  const attendance_percentage = req.body.attendance_percentage;
  const mid1 = req.body.mid1;
  const mid2 = req.body.mid2;
  const assignment = req.body.assignment;

  db.query(
    'UPDATE students SET attendance_percentage = ?, mid1 = ?, mid2 = ?, assignment = ? WHERE id = ?',
    [attendance_percentage, mid1, mid2, assignment, req.params.id],
    function(err) {
      if(err) return res.status(500).json({ message: 'Server error' });
      res.json({ message: 'Student updated successfully' });
    }
  );
});

module.exports = router;
