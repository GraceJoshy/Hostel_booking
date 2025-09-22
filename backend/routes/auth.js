// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// SECRET key for JWT (you can later move to .env)
const SECRET = 'someverysecretkey';

// ---------------- REGISTER ----------------
router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body; // role = student or warden
  if (!name || !email || !password || !role) return res.status(400).json({ message: 'Missing fields' });

  try {
    const hashed = await bcrypt.hash(password, 10); // encrypt password

    if (role === 'student') {
      const [result] = await db.query(
        'INSERT INTO students (name,email,password) VALUES (?,?,?)',
        [name,email,hashed]
      );
      const user = { id: result.insertId, role: 'student', name, email };
      const token = jwt.sign(user, SECRET, { expiresIn: '8h' });
      return res.json({ message: 'Registered', token, user });
    } else if (role === 'warden') {
      const [result] = await db.query(
        'INSERT INTO wardens (name,email,password) VALUES (?,?,?)',
        [name,email,hashed]
      );
      const user = { id: result.insertId, role: 'warden', name, email };
      const token = jwt.sign(user, SECRET, { expiresIn: '8h' });
      return res.json({ message: 'Registered (warden)', token, user });
    } else {
      return res.status(400).json({ message: 'Role must be student or warden' });
    }
  } catch(err){
    console.error('Register Error:', err); // log real error in backend console
    res.status(500).json({ message: 'Server error', error: err.message });
}
});

// ---------------- LOGIN ----------------
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  if (!email || !password || !role) return res.status(400).json({ message: 'Missing fields' });

  try {
    let [rows] = [];
    if (role === 'student') {
      [rows] = await db.query('SELECT id,name,email,password FROM students WHERE email = ?', [email]);
    } else {
      [rows] = await db.query('SELECT id,name,email,password FROM wardens WHERE email = ?', [email]);
    }

    if (!rows.length) return res.status(400).json({ message: 'Invalid credentials' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.password); // check password
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { id: user.id, role, name: user.name, email: user.email };
    const token = jwt.sign(payload, SECRET, { expiresIn: '8h' });
    res.json({ message: 'Logged in', token, user: payload });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;