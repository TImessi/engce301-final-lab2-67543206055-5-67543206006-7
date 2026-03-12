const express = require('express');
const { pool } = require('../db/db');
const { verifyToken } = require('../middleware/jwtUtils');

const router = express.Router();

// Helper: บันทึก log ลงฐานข้อมูลตัวเอง
async function logEvent({ level, event, userId, message, meta }) {
  try {
    await pool.query(
      `INSERT INTO logs (level, event, user_id, message, meta) VALUES ($1, $2, $3, $4, $5)`,
      [level, event, userId, message, meta]
    );
  } catch (err) {
    console.error('[LOG ERROR]', err);
  }
}

// Middleware: ตรวจสอบ JWT
function requireAuth(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized: No token provided' });
  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: ' + err.message });
  }
}

// GET /health
router.get('/health', (_, res) => res.json({ status:'ok', service:'user-service' }));

router.use(requireAuth);

// GET /api/users/profile
router.get('/profile', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [req.user.sub]);
    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({ profile: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/users/profile
router.put('/profile', async (req, res) => {
  const { display_name, bio, avatar_url } = req.body;
  try {
    const check = await pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [req.user.sub]);
    let result;
    if (check.rows[0]) {
      result = await pool.query(
        `UPDATE user_profiles SET display_name=COALESCE($1,display_name), bio=COALESCE($2,bio), avatar_url=COALESCE($3,avatar_url), updated_at=NOW()
         WHERE user_id=$4 RETURNING *`,
        [display_name, bio, avatar_url, req.user.sub]
      );
    } else {
      result = await pool.query(
        `INSERT INTO user_profiles (user_id, display_name, bio, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *`,
        [req.user.sub, display_name, bio, avatar_url]
      );
    }
    await logEvent({ level:'INFO', event:'PROFILE_UPDATED', userId: req.user.sub, message: `Profile updated` });
    res.json({ profile: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/users/all
router.get('/all', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM user_profiles ORDER BY id ASC');
    res.json({ users: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await pool.query('DELETE FROM user_profiles WHERE id = $1', [id]);
    await logEvent({ level:'INFO', event:'PROFILE_DELETED', userId: req.user.sub, message: `Profile ${id} deleted` });
    res.json({ message: 'Profile deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
