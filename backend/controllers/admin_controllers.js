const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ status: 'error', message: 'Username dan password wajib diisi!' });
    }

    const sql = 'SELECT * FROM admin WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
        if (err) return res.status(500).json({ status: 'error', message: 'Terjadi kesalahan server' });

        if (results.length === 0) {
            return res.status(401).json({ status: 'error', message: 'Username atau password salah!' });
        }

        const admin = results[0];
        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({ status: 'error', message: 'Username atau password salah!' });
        }

        const token = jwt.sign(
            { id: admin.id, username: admin.username }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.json({
            status: 'success',
            message: 'Yeay! Login berhasil.',
            data: {
                token: token,
                username: admin.username
            }
        });
    });
};

module.exports = { login };