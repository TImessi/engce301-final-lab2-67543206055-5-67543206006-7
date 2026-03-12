const express = require('express');
const router = express.Router();
const { pool } = require('../db/db'); // ตรวจสอบว่าไฟล์ db.js เชื่อมต่อกับ user-db
const { authenticateToken } = require('../middleware/authMiddleware'); // ใช้ Middleware จาก Set 1

// GET /api/users/profile - ดู profile ตัวเอง
router.get('/profile', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [req.user.sub]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'ไม่พบข้อมูลโปรไฟล์' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/users/profile - แก้ไข profile
router.get('/profile', authenticateToken, async (req, res) => {
    const { display_name, bio, avatar_url } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO user_profiles (user_id, display_name, bio, avatar_url)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (user_id) DO UPDATE 
             SET display_name = $2, bio = $3, avatar_url = $4, updated_at = NOW()
             RETURNING *`,
            [req.user.sub, display_name, bio, avatar_url]
        );
        res.json({ message: 'อัปเดตโปรไฟล์สำเร็จ', profile: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/users/all - ดูรายชื่อ users ทั้งหมด (ใช้สำหรับ Admin หรือการทดสอบ)
router.get('/all', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM user_profiles');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/users/:id - ลบ user
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        // ในระบบจริงอาจต้องเช็ค Role ว่าเป็น Admin หรือไม่
        await pool.query('DELETE FROM user_profiles WHERE user_id = $1', [req.params.id]);
        res.json({ message: 'ลบข้อมูลโปรไฟล์สำเร็จ' });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;