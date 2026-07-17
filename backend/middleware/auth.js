const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "dev-admin-secret";

const verifyToken = (req, res, next) => {
  // Ambil token dari header Authorization
  const bearerHeader = req.headers["authorization"];

  if (!bearerHeader) {
    return res
      .status(403)
      .json({
        status: "error",
        message: "Akses ditolak! Token tidak ditemukan.",
      });
  }

  // Format standar token adalah "Bearer <token>"
  const token = bearerHeader.split(" ")[1];

  try {
    // Cek keaslian token pakai rahasia dari .env
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Simpan data admin ke dalam request
    next(); // Lanjut ke proses controller berikutnya
  } catch (err) {
    return res
      .status(401)
      .json({
        status: "error",
        message: "Token tidak valid atau sudah kedaluwarsa!",
      });
  }
};

module.exports = { verifyToken };
