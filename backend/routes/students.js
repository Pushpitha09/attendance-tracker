const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  db.query('SELECT * FROM students', (err, results) => {
    if(err) return res.status(500).json({ message: 'Server error' });
    res.json(results);
  });
});

router.post('/add', (req, res) => {
  const { roll_no, name, email, attendance_percentage, mid1, mid2, assignment } = req.body;

  db.query(
    'INSERT INTO students (roll_no, name, email, attendance_percentage, mid1, mid2, assignment) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [roll_no, name, email, attendance_percentage, mid1, mid2, assignment],
    (err, results) => {
      if(err) return res.status(500).json({ message: 'Server error', error: err });
      res.json({ message: 'Student added successfully', id: results.insertId });
    }
  );
});

router.delete('/delete/:id', (req, res) => {
  db.query('DELETE FROM students WHERE id = ?', [req.params.id], (err) => {
    if(err) return res.status(500).json({ message: 'Server error' });
    res.json({ message: 'Student deleted successfully' });
  });
});

router.put('/update/:id', (req, res) => {
  const { attendance_percentage, mid1, mid2, assignment } = req.body;

  db.query(
    'UPDATE students SET attendance_percentage = ?, mid1 = ?, mid2 = ?, assignment = ? WHERE id = ?',
    [attendance_percentage, mid1, mid2, assignment, req.params.id],
    (err) => {
      if(err) return res.status(500).json({ message: 'Server error' });
      res.json({ message: 'Student updated successfully' });
    }
  );
});

module.exports = router;