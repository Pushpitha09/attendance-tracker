const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', function(req, res) {
  db.query('SELECT * FROM subjects', function(err, results) {
    if(err) return res.status(500).json({ message: 'Server error' });
    res.json(results);
  });
});

router.post('/add', function(req, res) {
  const name = req.body.name;

  if(!name) return res.status(400).json({ message: 'Subject name is required!' });

  db.query('INSERT INTO subjects (name) VALUES (?)', [name], function(err, results) {
    if(err) return res.status(500).json({ message: 'Error adding subject' });
    res.json({ message: 'Subject added successfully!', id: results.insertId });
  });
});

router.delete('/delete/:id', function(req, res) {
  db.query('DELETE FROM subjects WHERE id = ?', [req.params.id], function(err) {
    if(err) return res.status(500).json({ message: 'Server error' });
    res.json({ message: 'Subject deleted successfully!' });
  });
});

module.exports = router;