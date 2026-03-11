const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/mark', (req, res) => {
  const { student_id, date, subject, status } = req.body;

  db.query(
    'INSERT INTO attendance (student_id, date, subject, status) VALUES (?, ?, ?, ?)',
    [student_id, date, subject, status],
    (err) => {
      if(err) return res.status(500).json({ message: 'Server error' });
      res.json({ message: 'Attendance marked successfully' });
    }
  );
});

router.get('/:student_id', (req, res) => {
  db.query(
    'SELECT * FROM attendance WHERE student_id = ?',
    [req.params.student_id],
    (err, results) => {
      if(err) return res.status(500).json({ message: 'Server error' });
      res.json(results);
    }
  );
});

module.exports = router;
