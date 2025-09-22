const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// Middleware: allow only wardens
function adminOnly(req,res,next){
  if(req.user.role !== 'warden') return res.status(403).json({message:'Access denied'});
  next();
}

// --------- View all rooms ---------
router.get('/rooms', auth, adminOnly, async (req,res)=>{
  try {
    const [rooms] = await db.query('SELECT * FROM rooms');
    res.json({rooms});
  } catch(err){
    console.error(err);
    res.status(500).json({message:'Server error'});
  }
});

// --------- View all complaints ---------
router.get('/complaints', auth, adminOnly, async (req,res)=>{
  try {
    const [complaints] = await db.query(
      `SELECT c.id, s.name as student_name, r.room_no, c.complaint_text, c.status, c.created_at
       FROM complaints c
       JOIN students s ON c.student_id = s.id
       LEFT JOIN rooms r ON c.room_id = r.id`
    );
    res.json({complaints});
  } catch(err){
    console.error(err);
    res.status(500).json({message:'Server error'});
  }
});

module.exports = router;