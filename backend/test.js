const db = require('./db');

async function testDB() {
  try {
    const [rows] = await db.query('SELECT NOW() as now'); // simple query
    console.log('Database connected! Time:', rows[0].now);
  } catch (err) {
    console.error('Database connection failed:', err);
  }
}

testDB();