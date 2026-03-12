const express  = require('express');
const bcrypt   = require('bcryptjs');
const { pool } = require('../db/db');
const { generateToken, verifyToken } = require('../middleware/jwtUtils');
const router = express.Router();

async function logEvent(data) {
    try {
        await fetch('http://log-service:3003/api/logs/internal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ service: 'auth-service', ...data })
        }).catch(() => {});
    } catch (e) {}
}

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบ' });

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
        const user = result.rows[0];

        // ใช้ Bcrypt ตรวจสอบ 100% ตามกฎ
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            await logEvent({ level: 'WARN', event: 'LOGIN_FAILED', message: `Login failed: ${email}` });
            return res.status(401).json({ error: 'Email หรือ Password ไม่ถูกต้อง' });
        }

        const token = generateToken({ sub: user.id, email: user.email, role: user.role, username: user.username });
        await logEvent({ level: 'INFO', event: 'LOGIN_SUCCESS', userId: user.id, message: `User ${user.username} logged in` });

        res.json({
            message: 'Login สำเร็จ',
            token,
            user: { id: user.id, username: user.username, email: user.email, role: user.role }
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;