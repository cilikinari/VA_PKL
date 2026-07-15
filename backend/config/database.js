const mysql = require('mysql2');

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'db_va_pkl',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

db.getConnection((err, connection) => {
    if (err) {
        console.error('Yah, gagal konek ke database:', err);
        return;
    }
    console.log('Yeay! Berhasil konek ke MySQL Laragon pakai Pool!');
    connection.release();
});

module.exports = db;