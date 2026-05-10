// ── userController.js ──────────────────────────────────────────
const pool    = require("../db");
const bcrypt  = require("bcryptjs");

exports.getAll = async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT u.id, u.nama, u.email, u.role, u.status,
        COUNT(rp.id) AS prediksi,
        TO_CHAR(u.created_at, 'DD Mon YYYY') AS bergabung
      FROM users u
      LEFT JOIN riwayat_prediksi rp ON rp.user_id = u.id
      GROUP BY u.id ORDER BY u.created_at DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.toggleStatus = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      UPDATE users SET
        status = CASE WHEN status = 'aktif' THEN 'nonaktif' ELSE 'aktif' END,
        updated_at = NOW()
      WHERE id = $1 RETURNING id, nama, email, role, status
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "User tidak ditemukan" });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) return res.status(400).json({ error: "Password min 6 karakter" });
    const hash = await bcrypt.hash(password, 12);
    await pool.query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2", [hash, req.params.id]);
    res.json({ message: "Password berhasil direset" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.create = async (req, res) => {
  try {
    const { nama, email, password, role } = req.body;
    if (!nama || !email || !password) return res.status(400).json({ error: "nama, email, password wajib" });
    const exists = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (exists.rows.length) return res.status(409).json({ error: "Email sudah digunakan" });
    const hash = await bcrypt.hash(password, 12);
    const { rows } = await pool.query(
      "INSERT INTO users (nama, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING id, nama, email, role, status",
      [nama, email, hash, role || "user"]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── insightController.js ───────────────────────────────────────
exports.getInsights = async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT id, judul, deskripsi, kategori, trend, nilai,
        TO_CHAR(created_at, 'DD Mon YYYY') AS tanggal
      FROM insights WHERE is_published ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createInsight = async (req, res) => {
  try {
    const { judul, deskripsi, kategori, trend, nilai } = req.body;
    const { rows } = await pool.query(`
      INSERT INTO insights (judul, deskripsi, kategori, trend, nilai)
      VALUES ($1,$2,$3,$4,$5) RETURNING *
    `, [judul, deskripsi, kategori, trend, nilai]);
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ── analisisController.js ──────────────────────────────────────
exports.getAnalisis = async (_req, res) => {
  try {
    const [dist, lokasi, scatter, korelasi] = await Promise.all([
      // Distribusi harga
      pool.query(`
        SELECT
          CASE
            WHEN harga_numeric < 500000000   THEN '< 500 Jt'
            WHEN harga_numeric < 1000000000  THEN '500Jt – 1M'
            WHEN harga_numeric < 1500000000  THEN '1M – 1.5M'
            WHEN harga_numeric < 2000000000  THEN '1.5M – 2M'
            WHEN harga_numeric < 3000000000  THEN '2M – 3M'
            WHEN harga_numeric < 5000000000  THEN '3M – 5M'
            ELSE '> 5M'
          END AS range_harga,
          COUNT(*) AS jumlah
        FROM dataset_rumah WHERE is_valid AND harga_numeric IS NOT NULL
        GROUP BY range_harga ORDER BY MIN(harga_numeric)
      `),

      // Harga per lokasi min/avg/max
      pool.query(`
        SELECT
          SPLIT_PART(lokasi, ',', 1)                      AS lokasi,
          ROUND(AVG(harga_numeric)::NUMERIC / 1e9, 2)     AS rata,
          ROUND(MIN(harga_numeric)::NUMERIC / 1e9, 2)     AS min,
          ROUND(MAX(harga_numeric)::NUMERIC / 1e9, 2)     AS max
        FROM dataset_rumah WHERE is_valid AND harga_numeric IS NOT NULL
        GROUP BY SPLIT_PART(lokasi, ',', 1)
        ORDER BY rata DESC LIMIT 10
      `),

      // Scatter: luas tanah vs harga (100 sample random)
      pool.query(`
        SELECT
          luas_tanah_numeric AS lt,
          ROUND(harga_numeric::NUMERIC / 1e9, 2) AS harga
        FROM dataset_rumah
        WHERE is_valid AND luas_tanah_numeric IS NOT NULL AND harga_numeric IS NOT NULL
        ORDER BY RANDOM() LIMIT 100
      `),

      // Korelasi Pearson
      pool.query(`
        SELECT
          ROUND(CORR(luas_bangunan_numeric, harga_numeric)::NUMERIC, 3) AS luas_bangunan,
          ROUND(CORR(luas_tanah_numeric, harga_numeric)::NUMERIC, 3)    AS luas_tanah,
          ROUND(CORR(kamar_tidur_numeric, harga_numeric)::NUMERIC, 3)   AS kamar_tidur,
          ROUND(CORR(kamar_mandi_numeric, harga_numeric)::NUMERIC, 3)   AS kamar_mandi,
          ROUND(CORR(CAST(garasi AS NUMERIC), harga_numeric)::NUMERIC, 3) AS garasi
        FROM dataset_rumah WHERE is_valid
      `),
    ]);

    res.json({
      distribusi_harga: dist.rows,
      harga_per_lokasi: lokasi.rows,
      scatter_data:     scatter.rows,
      korelasi:         korelasi.rows[0],
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
