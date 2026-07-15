const db = require('../config/database');
const stringSimilarity = require('string-similarity');

// Menampilkan rekomendasi pertanyaan
const getRecommendations = (req, res) => {
    const sql = 'SELECT id, pertanyaan FROM faq';
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error saat mengambil data FAQ:', err);
            return res.status(500).json({ status: 'error', message: 'Terjadi kesalahan pada server' });
        }
        
        res.json({
            status: 'success',
            data: results
        });
    });
};

// Menangani input chat dari user
const handleChat = (req, res) => {
    const { id, text } = req.body;

    // SKENARIO A: Berdasarkan Tombol ID
    if (id) {
        const sqlById = 'SELECT jawaban FROM faq WHERE id = ?';
        db.query(sqlById, [id], (err, results) => {
            if (err) return res.status(500).json({ status: 'error', message: err.message });
            
            if (results.length > 0) {
                return res.json({ status: 'success', data: { jawaban: results[0].jawaban } });
            }
            return res.json({ status: 'not_found', data: { jawaban: "Maaf, data tidak ditemukan." } });
        });
    } 
    // SKENARIO B: Berdasarkan Input Teks Manual (Dengan Toleransi Typo)
    else if (text !== undefined) {
        const userText = text.trim().toLowerCase(); 
        
        if (!userText) {
            return res.status(400).json({ status: 'error', message: 'Teks pertanyaan tidak boleh kosong.' });
        }

        // Pecah kalimat user menjadi array kata unik dan bersihkan dari kata kosong
        const userWords = userText.split(/\s+/).filter(w => w.length > 0); 

        const sqlAll = 'SELECT jawaban, keyword FROM faq';
        
        db.query(sqlAll, (err, results) => {
            if (err) return res.status(500).json({ status: 'error', message: err.message });
            
            let jawabanDitemukan = null;
            let maxMatchCount = 0;

            for (let i = 0; i < results.length; i++) {
                const row = results[i];
                if (!row.keyword) continue;
                
                const keywordsArray = row.keyword
                    .split(',')
                    .map(k => k.trim().toLowerCase())
                    .filter(k => k.length > 0); 
                
                let matchCount = 0;

                keywordsArray.forEach(keyword => {
                    // 1. Cek jika keyword (bisa berupa kata/frasa) ada di dalam teks input user (Cocok Persis)
                    if (userText.includes(keyword)) {
                        matchCount += 1.5; 
                    } 
                    // 2. Jika tidak cocok persis, cek kedekatan per kata (Toleransi Typo)
                    else {
                        userWords.forEach(word => {
                            // Hitung rasio kemiripan (0.0 - 1.0)
                            const similarity = stringSimilarity.compareTwoStrings(word, keyword);
                            if (similarity >= 0.75) { // Ditingkatkan sedikit ke 0.75 agar lebih presisi
                                matchCount += 1.0;
                            }
                        });
                    }
                });
                
                // Cari FAQ yang menghasilkan bobot skor tertinggi
                if (matchCount > maxMatchCount) {
                    maxMatchCount = matchCount;
                    jawabanDitemukan = row.jawaban;
                }
            }

            // PENGUBAHAN VALIDASI: >= 1.0 agar kata typo yang mirip (skor 1) atau cocok persis (skor 1.5) tetap lolos
            if (jawabanDitemukan && maxMatchCount >= 1.0) {
                return res.json({ status: 'success', data: { jawaban: jawabanDitemukan } });
            } else {
                return res.json({ 
                    status: 'not_found', 
                    data: { jawaban: "Maaf, informasi yang Anda tanyakan belum tersedia. Silakan hubungi admin BPS atau Walidata terkait." } 
                });
            }
        });
    } else {
        res.status(400).json({ status: 'error', message: 'Harap kirimkan id atau text pertanyaan.' });
    }
};

module.exports = {
    getRecommendations,
    handleChat
};