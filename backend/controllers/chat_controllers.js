const db = require("../config/database");
const { GoogleGenerativeAI } = require("@google/generative-ai");

let pipeline;
let extractor;
let faqCache = [];

// --- Setup Gemini (dipakai buat normalisasi teks & merapikan jawaban) ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

// Fungsi untuk menghitung kemiripan (Cosine Similarity)
const cosineSimilarity = (vecA, vecB) => {
  let dotProduct = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return dotProduct;
};

// Fungsi untuk mengambil data FAQ dari MySQL dan mengubahnya jadi Vektor (Embedding)
const loadFaqToMemory = () => {
  db.query("SELECT id, pertanyaan, jawaban FROM faq", async (err, results) => {
    if (err) return console.error("Gagal load FAQ untuk AI:", err);

    faqCache = [];
    for (let row of results) {
      try {
        const output = await extractor(row.pertanyaan, { pooling: "mean", normalize: true });
        const arr = output.data ?? output.embedding ?? output[0]?.data ?? output[0]?.embedding ?? output;
        const vector = Array.from(arr);

        faqCache.push({
          id: row.id,
          pertanyaan: row.pertanyaan,
          jawaban: row.jawaban,
          vector: vector,
        });
      } catch (error) {
        console.error(`Gagal memproses embedding untuk FAQ ID ${row.id}`, error);
      }
    }
    console.log(`[AI] Berhasil memproses ${faqCache.length} data FAQ ke dalam memori.`);
  });
};

(async () => {
  try {
    const transformersModule = await import("@xenova/transformers");
    const { pipeline } = transformersModule.default ?? transformersModule;

    console.log("[AI] Memuat model AI Embedding (butuh beberapa detik)...");

    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("[AI] Model AI siap digunakan!");

    loadFaqToMemory();
  } catch (err) {
    console.error("[AI] Gagal memuat model AI:", err);
  }
})();

// --- Fungsi normalisasi kalimat user (perbaiki typo/singkatan) pakai Gemini ---
const normalizeWithGemini = async (text) => {
  try {
    const prompt = `Perbaiki kalimat berikut menjadi Bahasa Indonesia yang baku dan jelas,
tanpa mengubah maksud aslinya. Perbaiki typo dan singkatan (misal "gk" jadi "tidak", "gmn" jadi "bagaimana").
Jawab HANYA dengan kalimat hasil perbaikan, tanpa tanda kutip, tanpa penjelasan apapun.

Kalimat: "${text}"`;

    const result = await geminiModel.generateContent(prompt);
    const normalized = result.response.text().trim();

    console.log(`[Gemini] Normalisasi: "${text}" -> "${normalized}"`);
    return normalized || text;
  } catch (err) {
    console.error("[Gemini] Gagal normalisasi teks, pakai teks asli:", err.message);
    return text; // fallback ke teks asli kalau Gemini gagal/limit habis
  }
};

// --- Fungsi generate jawaban natural pakai Gemini (RAG generation step) ---
const generateNaturalAnswer = async (userQuestion, matchedFaq) => {
  try {
    const prompt = `Kamu adalah asisten FAQ. Jawab pertanyaan user berdasarkan informasi berikut,
dengan bahasa yang natural dan ramah. Jangan menambahkan informasi di luar konteks ini.
Kalau user pakai bahasa gaul/typo, tetap pahami maksudnya.

Pertanyaan referensi FAQ: "${matchedFaq.pertanyaan}"
Jawaban referensi: "${matchedFaq.jawaban}"

Pertanyaan user: "${userQuestion}"

Jawab singkat dan jelas:`;

    const result = await geminiModel.generateContent(prompt);
    // Hapus sapaan pembuka yang mungkin ditambahkan model (Halo, Hallo, Hi, dll.)
    const raw = result.response.text();
    const cleaned = stripLeadingGreeting(raw);
    return cleaned;
  } catch (err) {
    console.error("[Gemini] Gagal generate jawaban, fallback ke jawaban FAQ mentah:", err.message);
    return matchedFaq.jawaban;
  }
};

// Hapus sapaan di awal teks agar asisten tidak selalu menambahkan "Halo" di setiap jawaban
const stripLeadingGreeting = (text) => {
  if (!text || typeof text !== 'string') return text;
  // regex untuk menangani variasi sapaan di awal
  return text.replace(/^\s*(halo|hallo|hai|hi|hey|hello)\b[\s!,:.-]*/i, '').trim();
};

// --- Fungsi bantu: cari FAQ paling mirip dari sebuah teks ---
const findBestMatch = async (text) => {
  const userOutput = await extractor(text, { pooling: "mean", normalize: true });
  const userArr = userOutput.data ?? userOutput.embedding ?? userOutput[0]?.data ?? userOutput[0]?.embedding ?? userOutput;
  const userVector = Array.from(userArr);

  let bestMatch = null;
  let highestScore = -1;

  for (let faq of faqCache) {
    const score = cosineSimilarity(userVector, faq.vector);
    if (score > highestScore) {
      highestScore = score;
      bestMatch = faq;
    }
  }

  return { bestMatch, highestScore };
};

const greetingResponses = [
  "Ada yang bisa saya bantu? Silakan bertanya terkait informasi yang Anda butuhkan. Jika pertanyaan tidak bisa dijawab oleh saya, silakan hubungi admin terkait.",
];

const gratitudeResponses = [
  "Sama-sama, senang bisa membantu. Jika ada pertanyaan lain, silakan bertanya kembali.",
];

const isGreetingText = (text) => {
  const normalizedText = text.toLowerCase().replace(/[^\w\s]/gi, " ").trim();
  if (!normalizedText) return false;

  const greetingPatterns = [
    /\bhalo\b/, /\bhai\b/, /\bhallo\b/, /\bhi\b/, /\bhey\b/, /\bselamat\s+(pagi|siang|sore|malam)\b/,
  ];

  return greetingPatterns.some((pattern) => pattern.test(normalizedText));
};

const isGratitudeText = (text) => {
  const normalizedText = text.toLowerCase().replace(/[^\w\s]/gi, " ").trim();
  if (!normalizedText) return false;

  const gratitudePatterns = [
    /\bterima\s+kasih\b/, /\bmakasih\b/, /\bmakasih\s+banyak\b/, /\bthanks\b/, /\bthank\s+you\b/, /\bthx\b/,
  ];

  return gratitudePatterns.some((pattern) => pattern.test(normalizedText));
};

const acknowledgementResponses = [
  "Baik, senang bisa membantu. Ada lagi yang bisa saya bantu?",
];

const isAcknowledgementText = (text) => {
  const normalizedText = text.toLowerCase().replace(/[^\w\s]/gi, " ").trim();
  if (!normalizedText) return false;

  const ackPatterns = [
    /^oke*\b/, /^ok\b/, /^sip\b/, /^siap\b/, /^y+a*\b/, /^gapapa\b/, /^tidak\s+ada\b/,
    /^(ng?gak|ngga|enggak)\s*(ada|apa)?\b/, /\bsuksma\b/, /\bmakasi+h*\b/,
  ];

  // Kalimat pendek (<=4 kata) yang cocok pola basa-basi
  const wordCount = normalizedText.split(/\s+/).length;
  return wordCount <= 4 && ackPatterns.some((pattern) => pattern.test(normalizedText));
};

const getRecommendations = (req, res) => {
  const sql = "SELECT id, pertanyaan FROM faq";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error saat mengambil data FAQ:", err);
      return res.status(500).json({ status: "error", message: "Terjadi kesalahan pada server" });
    }
    res.json({ status: "success", data: results });
  });
};

const handleChat = async (req, res) => {
  const { id, text } = req.body;

  // SKENARIO A: Berdasarkan Tombol ID
  if (id) {
    const sqlById = "SELECT jawaban FROM faq WHERE id = ?";
    
    // 1. Panggil db.query TANPA awalan 'return'
    db.query(sqlById, [id], (err, results) => {
      if (err) return res.status(500).json({ status: "error", message: err.message });

      if (results.length > 0) {
        return res.json({ status: "success", data: { jawaban: results[0].jawaban } });
      }
      return res.json({
        status: "not_found",
        data: { jawaban: "Maaf, data tidak ditemukan." },
      });
    });

    // 2. Tambahkan return di sini agar kode tidak bablas ke Skenario B!
    return;
  }

  // SKENARIO B: PENCARIAN AI (SEMANTIC SEARCH)
  if (text !== undefined) {
    if (!text.trim()) {
      return res.status(400).json({ status: "error", message: "Teks pertanyaan tidak boleh kosong." });
    }

    // --- CEK BASA-BASI DULU (Cukup sekali saja di sini) ---
    if (isGreetingText(text)) {
      const randomGreeting = greetingResponses[Math.floor(Math.random() * greetingResponses.length)];
      return res.json({ status: "success", data: { jawaban: randomGreeting } });
    }

    if (isGratitudeText(text)) {
      const randomGratitude = gratitudeResponses[Math.floor(Math.random() * gratitudeResponses.length)];
      return res.json({ status: "success", data: { jawaban: randomGratitude } });
    }

    if (isAcknowledgementText(text)) {
      const randomAck = acknowledgementResponses[Math.floor(Math.random() * acknowledgementResponses.length)];
      return res.json({ status: "success", data: { jawaban: randomAck } });
    }

    // --- JIKA BUKAN BASA-BASI, MASUK KE AI ---
    if (!extractor || faqCache.length === 0) {
      return res.status(503).json({
        status: "error",
        message: "Sistem AI sedang bersiap, mohon tunggu sebentar lalu coba lagi.",
      });
    }

    const THRESHOLD = 0.55;

    try {
      // 1. Coba cari match pakai teks ASLI dulu
      let { bestMatch, highestScore } = await findBestMatch(text);
      let queryUsedForAnswer = text;
      let wasNormalized = false;

      // 2. Kalau nggak ketemu match yang cukup mirip, baru coba normalisasi pakai Gemini
      if (!bestMatch || highestScore < THRESHOLD) {
        const normalizedText = await normalizeWithGemini(text);

        if (normalizedText !== text) {
          const retryResult = await findBestMatch(normalizedText);
          if (retryResult.highestScore > highestScore) {
            bestMatch = retryResult.bestMatch;
            highestScore = retryResult.highestScore;
            queryUsedForAnswer = normalizedText;
            wasNormalized = true;
          }
        }
      }

      // 3. Validasi akhir dengan Threshold
      if (bestMatch && highestScore >= THRESHOLD) {
        const naturalAnswer = await generateNaturalAnswer(queryUsedForAnswer, bestMatch);

        return res.json({
          status: "success",
          data: {
            jawaban: naturalAnswer,
            debug_score: highestScore,
            debug_pertanyaan_mirip: bestMatch.pertanyaan,
            debug_was_normalized: wasNormalized,
            debug_query_used: queryUsedForAnswer,
          },
        });
      } else {
        return res.json({
          status: "not_found",
          data: {
            jawaban: "Maaf, informasi yang Anda tanyakan belum tersedia. Silakan hubungi admin terkait.",
          },
        });
      }
    } catch (err) {
      console.error("AI Evaluation Error:", err);
      return res.status(500).json({ status: "error", message: "Gagal memproses AI." });
    }
  }

  // Jika Request body tidak memiliki 'id' maupun 'text'
  return res.status(400).json({ status: "error", message: "Format input tidak valid." });
};

module.exports = {
  getRecommendations,
  handleChat,
  loadFaqToMemory,
};