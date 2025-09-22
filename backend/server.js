// server.js
const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');




app.use(cors({
    origin: 'http://127.0.0.1:5500', // frontend URL
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    credentials: true
}));
app.use(bodyParser.json());
// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
const studentRoutes = require('./routes/student');
app.use('/api/student', studentRoutes);
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);



app.get('/', (req,res) => res.send('Backend is running'));
//const studentRoutes = require('./routes/student');
//app.use('/api/student', studentRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log('Server running on port${PORT}'));