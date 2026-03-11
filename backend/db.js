const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root2309',
  database: 'attendance_tracker'
});

db.connect(function(err) {
  if(err) {
    console.log('Database connection failed:', err);
    return;
  }
  console.log('MySQL Connected!');
});

module.exports = db;
