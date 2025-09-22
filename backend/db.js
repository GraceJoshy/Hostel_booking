// db.js
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'hosteluser',
  password: process.env.DB_PASS || 'hostelpass',
  database: process.env.DB_NAME || 'hostel_db',
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;