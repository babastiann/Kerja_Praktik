const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "rumah_bandung_secret_key";

/**
 * Verifikasi JWT dari header Authorization: Bearer <token>
 */
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token tidak ditemukan" });
  }
  const token = header.split(" ")[1];
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Token tidak valid atau sudah expired" });
  }
}

/**
 * Hanya admin yang boleh akses
 */
function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Hanya admin yang bisa mengakses endpoint ini" });
  }
  next();
}

module.exports = { authMiddleware, adminOnly };
