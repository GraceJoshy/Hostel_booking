const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

// ---------------- List available rooms ----------------
router.get('/rooms', auth, async (req, res) => {
  try {
    // FIX: Alias the 'id' column as 'room_id'
    const [rooms] = await db.query('SELECT id AS room_id, room_no, type, capacity, current_occupancy FROM rooms WHERE current_occupancy < capacity');
    res.json({ rooms });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------- Book a room ----------------
router.post('/book', auth, async (req, res) => {
    const studentId = req.user.id; // from JWT
    const { room_id, duration_days } = req.body;
    if (!room_id || !duration_days) return res.status(400).json({ message: 'Missing fields' });

    try {
        // check room availability
        const [rooms] = await db.query('SELECT * FROM rooms WHERE id = ? AND current_occupancy < capacity', [room_id]);
        if (!rooms.length) return res.status(400).json({ message: 'Room not available' });

        // create booking
        const [result] = await db.query(
          'INSERT INTO bookings (student_id, room_id, booking_date, duration_days) VALUES (?,?,NOW(),?)',
          [studentId, room_id,booking_date, duration_days]
        );

        // increase current occupancy
        await db.query('UPDATE rooms SET current_occupancy = current_occupancy + 1 WHERE id = ?', [room_id]);

        res.json({ message: 'Room booked successfully', booking_id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// --------- Make a Complaint ---------
router.post('/complaint', auth, async (req,res)=>{
    const studentId = req.user.id;
    const { room_id, complaint_text } = req.body;
    if(!complaint_text) return res.status(400).json({message:'Complaint text required'});
    
    try {
        await db.query(
            'INSERT INTO complaints (student_id, room_id, complaint_text) VALUES (?,?,?)',
            [studentId, room_id || null, complaint_text]
        );
        res.json({message:'Complaint submitted successfully'});
    } catch(err){
        console.error(err);
        res.status(500).json({message:'Server error'});
    }
});

// --------- View Bookings ---------
router.get('/bookings', auth, async (req,res)=>{
    const studentId = req.user.id;
    try {
        const [bookings] = await db.query(
            `SELECT b.id as booking_id, r.room_no, r.type, b.booking_date, b.duration_days, b.active
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            WHERE b.student_id=?`, [studentId]
        );
        res.json({bookings});
    } catch(err){
        console.error(err);
        res.status(500).json({message:'Server error'});
    }
});

// --------- Make Payment ---------
router.post('/payment', auth, async (req,res)=>{
    const { booking_id, amount } = req.body;
    if(!booking_id || !amount) return res.status(400).json({message:'Booking ID and amount required'});

    try {
        await db.query(
            'INSERT INTO payments (booking_id, amount, payment_date, status) VALUES (?, ?, NOW(), "PAID")',
            [booking_id, amount]
        );
        res.json({message:'Payment successful'});
    } catch(err){
        console.error(err);
        res.status(500).json({message:'Server error'});
    }
});
module.exports = router;