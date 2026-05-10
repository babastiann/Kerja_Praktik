const bcrypt = require("bcryptjs");
const jwt    = require("jsonwebtoken");
const pool   = require("../db");

const SECRET = process.env.JWT_SECRET || "rumah_bandung_secret_key";

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email dan password wajib diisi" });

    const { rows } = await pool.query(
      "SELECT id, nama, email, password_hash, role, status FROM users WHERE email = $1",
      [email]
    );
    const user = rows[0];
    if (!user) return res.status(401).json({ error: "Email tidak ditemukan" });
    if (user.status === "nonaktif") return res.status(403).json({ error: "Akun nonaktif, hubungi admin" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ error: "Password salah" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, nama: user.nama },
      SECRET,
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: { id: user.id, nama: user.nama, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { nama, email, password } = req.body;
    if (!nama || !email || !password) return res.status(400).json({ error: "Semua field wajib diisi" });
    if (password.length < 6) return res.status(400).json({ error: "Password minimal 6 karakter" });

    const exists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (exists.rows.length) return res.status(409).json({ error: "Email sudah digunakan" });

    const hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      "INSERT INTO users (nama, email, password_hash) VALUES ($1,$2,$3) RETURNING id, nama, email, role, status, created_at",
      [nama, email, hash]
    );
    res.status(201).json({ message: "Registrasi berhasil", user: rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/auth/me
exports.me = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, nama, email, role, status, created_at FROM users WHERE id = $1",
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: "User tidak ditemukan" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
