const db = require('../config/database');

// [READ] Ambil semua data FAQ
const getAllFaq = (req, res) => {
    const sql = 'SELECT * FROM faq ORDER BY id DESC';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ status: 'error', message: err.message });
        res.json({ status: 'success', data: results });
    });
};

// [CREATE] Tambah FAQ baru
const createFaq = (req, res) => {
    const { pertanyaan, jawaban, keyword } = req.body;

    if (!pertanyaan || !jawaban || !keyword) {
        return res.status(400).json({ status: 'error', message: 'Pertanyaan, jawaban, dan keyword wajib diisi!' });
    }

    const sql = 'INSERT INTO faq (pertanyaan, jawaban, keyword) VALUES (?, ?, ?)';
    db.query(sql, [pertanyaan, jawaban, keyword], (err, results) => {
        if (err) return res.status(500).json({ status: 'error', message: err.message });
        res.status(201).json({ status: 'success', message: 'Data FAQ berhasil ditambahkan!' });
    });
};

// [UPDATE - PATCH] Edit FAQ sebagian berdasarkan ID
const updateFaq = (req, res) => {
    const faqId = req.params.id;
    const { pertanyaan, jawaban, keyword } = req.body;

    // Kumpulkan kolom mana saja yang mau di-update
    let updateFields = [];
    let queryValues = [];

    if (pertanyaan) {
        updateFields.push('pertanyaan = ?');
        queryValues.push(pertanyaan);
    }
    if (jawaban) {
        updateFields.push('jawaban = ?');
        queryValues.push(jawaban);
    }
    if (keyword) {
        updateFields.push('keyword = ?');
        queryValues.push(keyword);
    }

    // Kalau admin nge-klik save tapi nggak ada data yang diubah
    if (updateFields.length === 0) {
        return res.status(400).json({ status: 'error', message: 'Tidak ada data yang dikirim untuk diubah!' });
    }

    // Gabungkan query secara dinamis
    const sql = `UPDATE faq SET ${updateFields.join(', ')} WHERE id = ?`;
    queryValues.push(faqId); // Masukkan ID ke urutan paling akhir untuk WHERE id = ?

    db.query(sql, queryValues, (err, results) => {
        if (err) return res.status(500).json({ status: 'error', message: err.message });
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: 'Data FAQ tidak ditemukan!' });
        }
        res.json({ status: 'success', message: 'Data FAQ berhasil diperbarui!' });
    });
};

// [DELETE] Hapus FAQ berdasarkan ID
const deleteFaq = (req, res) => {
    const faqId = req.params.id;

    const sql = 'DELETE FROM faq WHERE id = ?';
    db.query(sql, [faqId], (err, results) => {
        if (err) return res.status(500).json({ status: 'error', message: err.message });

        if (results.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: 'Data FAQ tidak ditemukan!' });
        }
        res.json({ status: 'success', message: 'Data FAQ berhasil dihapus!' });
    });
};

module.exports = {
    getAllFaq,
    createFaq,
    updateFaq,
    deleteFaq
};