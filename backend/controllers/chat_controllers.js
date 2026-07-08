const db = require('../config/database');

// Menampilkan rekomendasi pertanyaan
const getRecommendations = (req, res) => {
    console.log("=> Yay! Endpoint /recommendations berhasil dipanggil!");
    const sql = 'SELECT id, pertanyaan FROM faq';
    
    db.query(sql, (err, results) => {
        console.log("=> Query database selesai dijalankan!");

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

    if (id) {
        const sqlById = 'SELECT jawaban FROM faq WHERE id = ?';
        db.query(sqlById, [id], (err, results) => {
            console.log("=> Query database selesai dijalankan!");
            if (err) return res.status(500).json({ status: 'error', message: err.message });
            
            if (results.length > 0) {
                return res.json({ status: 'success', data: { jawaban: results[0].jawaban } });
            }
            return res.json({ status: 'not_found', data: { jawaban: "Maaf, data tidak ditemukan." } });
        });
    } else if (text !== undefined) {
        const userText = text.trim().toLowerCase(); 

        if (!userText) {
            return res.status(400).json({ status: 'error', message: 'Teks pertanyaan tidak boleh kosong.' });
        }

        const sqlAll = 'SELECT jawaban, keyword FROM faq';
        
        db.query(sqlAll, (err, results) => {
            if (err) return res.status(500).json({ status: 'error', message: err.message });
            
            let jawabanDitemukan = null;

            for (let i = 0; i < results.length; i++) {
                const row = results[i];
                
                if (!row.keyword) continue;
                
                const keywordsArray = row.keyword
                    .split(',')
                    .map(k => k.trim().toLowerCase())
                    .filter(k => k.length > 0); 
                
                const isMatch = keywordsArray.some(keyword => userText.includes(keyword));
                
                if (isMatch) {
                    jawabanDitemukan = row.jawaban;
                    break;
                }
            }

            if (jawabanDitemukan) {
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