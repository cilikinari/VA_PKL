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
    // SKENARIO B: Fokus Murni Deteksi Typo
    else if (text !== undefined) {
        // 1. Bersihkan tanda baca dari input user
        let userTextClean = text.toLowerCase().replace(/[^\w\s]/gi, '').trim(); 
        let userWords = userTextClean.split(/\s+/).filter(w => w.length > 0); 
        
        if (!userTextClean) {
            return res.status(400).json({ status: 'error', message: 'Teks pertanyaan tidak boleh kosong.' });
        }

        const sqlAll = 'SELECT jawaban, keyword FROM faq';
        db.query(sqlAll, (err, faqResults) => {
            if (err) return res.status(500).json({ status: 'error', message: err.message });
            
            let jawabanDitemukan = null;
            let maxMatchCount = 0;

            for (let i = 0; i < faqResults.length; i++) {
                const row = faqResults[i];
                if (!row.keyword) continue;
                
                const keywordsArray = row.keyword.split(',').map(k => k.trim().toLowerCase()).filter(k => k.length > 0); 
                let matchCount = 0;

                keywordsArray.forEach(keyword => {
                    // A. Cek Frasa Utuh 
                    if (keyword.includes(' ') && userTextClean.includes(keyword)) {
                        matchCount += 3; 
                    } 
                    
                    // B. Cek Per Kata (Toleransi Imbuhan & Typo)
                    const singleKeywords = keyword.split(' ');
                    singleKeywords.forEach(singleKey => {
                        userWords.forEach(word => {
                            // 1. Cocok persis
                            if (word === singleKey) {
                                matchCount += 2;
                            } 
                            // 2. Imbuhan
                            else if (word.length >= 4 && singleKey.length >= 4 && (word.includes(singleKey) || singleKey.includes(word))) {
                                matchCount += 1;
                            } 
                            // 3. Typo Detection (Sørensen–Dice Coefficient)
                            else {
                                const similarity = stringSimilarity.compareTwoStrings(word, singleKey);
                                if (similarity >= 0.55) { 
                                    // Skor dinamis: makin mirip, poin makin tinggi
                                    matchCount += (similarity * 2); 
                                }
                            }
                        });
                    });
                });
                
                // Cek siapa FAQ dengan skor tertinggi
                if (matchCount > maxMatchCount) {
                    maxMatchCount = matchCount;
                    jawabanDitemukan = row.jawaban;
                }
            }

            // Validasi sukses jika skor >= 1.0
            if (jawabanDitemukan && maxMatchCount >= 1.0) {
                return res.json({ status: 'success', data: { jawaban: jawabanDitemukan } });
            } else {
                return res.json({ 
                    status: 'not_found', 
                    data: { jawaban: "Maaf, informasi yang Anda tanyakan belum tersedia. Silakan hubungi admin terkait." } 
                });
            }
        });
    }
};

module.exports = {
    getRecommendations,
    handleChat
};