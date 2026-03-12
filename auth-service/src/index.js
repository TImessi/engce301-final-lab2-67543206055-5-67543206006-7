const express = require('express');
const router = express.Router();
const { pool } = require('./db/db'); // ตรวจสอบว่าไฟล์ db.js เชื่อมต่อถูกตัว
const bcrypt = require('bcryptjs');
// ต้องมีบรรทัดนี้เพื่อให้ Server ไม่ปิดตัวเอง


// ❌ ห้ามใส่ /api/auth/register เพราะใน index.js ใส่ให้แล้ว
// ✅ ให้ใส่แค่ /register
router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
    try {
        const password_hash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (username, password_hash, email) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, password_hash, email]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'สมัครสมาชิกไม่สำเร็จ อาจมีข้อมูลซ้ำ' });
    }
});

// อย่าลืมบรรทัดนี้เด็ดขาด!
module.exports = router;