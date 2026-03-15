const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

router.post('/login', function(req, res) {
  const email = req.body.email;
  const password = req.body.password;
  const role = req.body.role;

  db.query('SELECT * FROM users WHERE email = ? AND role = ?', [email, role], function(err, results) {
    if(err) return res.status(500).json({ message: 'Server error' });
    if(results.length === 0) return res.status(401).json({ message: 'User not found!' });

    const user = results[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    if(!isMatch) return res.status(401).json({ message: 'Invalid password!' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'rgmcet_secret_key',
      { expiresIn: '1d' }
    );

    res.json({ token: token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
  });
});

router.post('/signup', function(req, res) {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const role = req.body.role;

  db.query('SELECT * FROM users WHERE email = ?', [email], function(err, results) {
    if(err) return res.status(500).json({ message: 'Server error' });
    if(results.length > 0) return res.status(400).json({ message: 'Email already exists!' });

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role],
      function(err2, result) {
        if(err2) return res.status(500).json({ message: 'Error creating account!' });
        res.json({ message: 'Account created successfully!' });
      }
    );
  });
});

module.exports = router;