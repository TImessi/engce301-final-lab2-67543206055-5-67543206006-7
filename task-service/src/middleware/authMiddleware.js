const { verifyToken } = require('./jwtUtils');
const { pool } = require('../db/db');

module.exports = function requireAuth(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  try {
    req.user = verifyToken(token);  // { sub, email, role, username }
    next();
  } catch (err) {
    // บันทึก log ลง DB ตัวเอง (fire-and-forget)
    pool.query(
      'INSERT INTO logs (level, event, message, meta) VALUES ($1, $2, $3, $4)',
      ['ERROR', 'JWT_INVALID', 'Invalid JWT token: ' + err.message, { error: err.message }]
    ).catch(() => {});
    return res.status(401).json({ error: 'Unauthorized: ' + err.message });
  }
};