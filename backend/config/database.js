const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_va_pkl'
});

db.connect((err) => {
    if (err) {
        console.error('Yah, gagal konek ke database:', err);
        return;
    }
    console.log('Yeay! Berhasil konek ke MySQL Laragon!');
});

module.exports = db;