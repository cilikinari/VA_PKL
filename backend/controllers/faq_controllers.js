const db = require('../config/database');
// 1. Import fungsi reload memori AI dari chat_controllers
const { loadFaqToMemory } = require('./chat_controllers');

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
        
        // 2. Panggil fungsi ini agar AI langsung belajar data baru
        loadFaqToMemory(); 
        
        res.status(201).json({ status: 'success', message: 'Data FAQ berhasil ditambahkan!' });
    });
};

// [UPDATE - PATCH] Edit FAQ sebagian berdasarkan ID
const updateFaq = (req, res) => {
    const faqId = req.params.id;
    const { pertanyaan, jawaban, keyword } = req.body;

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

    if (updateFields.length === 0) {
        return res.status(400).json({ status: 'error', message: 'Tidak ada data yang dikirim untuk diubah!' });
    }

    const sql = `UPDATE faq SET ${updateFields.join(', ')} WHERE id = ?`;
    queryValues.push(faqId); 

    db.query(sql, queryValues, (err, results) => {
        if (err) return res.status(500).json({ status: 'error', message: err.message });
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ status: 'error', message: 'Data FAQ tidak ditemukan!' });
        }

        // 3. Panggil fungsi ini agar AI tahu ada perubahan data
        loadFaqToMemory();

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

        // 4. Panggil fungsi ini agar AI menghapus data lama dari ingatannya
        loadFaqToMemory();

        res.json({ status: 'success', message: 'Data FAQ berhasil dihapus!' });
    });
};

module.exports = {
    getAllFaq,
    createFaq,
    updateFaq,
    deleteFaq
};