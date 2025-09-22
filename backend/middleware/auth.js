// middleware/auth.js
const jwt = require('jsonwebtoken');
const SECRET = 'someverysecretkey';

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1]; // "Bearer <token>"
  if (!token) return res.status(401).json({ message: 'Invalid token format' });

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded; // attach user info to request
    next(); // allow access
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
}

module.exports = authMiddleware;