const pool   = require("../db");
const multer = require("multer");
const path   = require("path");
const fs     = require("fs");

// Multer config untuk upload CSV
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, "uploads/"),
  filename:    (_, file, cb) => cb(null, `dataset_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({
  storage,
  fileFilter: (_, file, cb) => {
    const ok = [".csv", ".xlsx"].includes(path.extname(file.originalname).toLowerCase());
    cb(ok ? null : new Error("Hanya file CSV/XLSX yang diizinkan"), ok);
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});
exports.upload = upload.single("file");

// GET /api/dataset — paginasi + search
exports.getAll = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    let whereClause = "";
    const params = [limit, offset];
    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      whereClause = `WHERE LOWER(SPLIT_PART(lokasi,',',1)) ILIKE $${params.length}`;
    }

    const countSQL = `SELECT COUNT(*) FROM dataset_rumah ${whereClause}`;
    const dataSQL  = `
      SELECT id, nama, SPLIT_PART(lokasi,',',1) AS lokasi,
        luas_tanah_numeric AS lt, luas_bangunan_numeric AS lb,
        kamar_tidur, kamar_mandi, garasi, jumlah_lantai,
        harga_numeric, sertifikat, is_valid
      FROM dataset_rumah
      ${whereClause}
      ORDER BY id DESC LIMIT $1 OFFSET $2
    `;

    const [countRes, dataRes] = await Promise.all([
      pool.query(countSQL, search ? [params[2]] : []),
      pool.query(dataSQL, params),
    ]);

    res.json({
      data:       dataRes.rows,
      total:      parseInt(countRes.rows[0].count),
      page,
      limit,
      totalPages: Math.ceil(countRes.rows[0].count / limit),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/dataset/stats
exports.getStats = async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*)                            AS total,
        COUNT(*) FILTER (WHERE is_valid)    AS valid,
        COUNT(*) FILTER (WHERE NOT is_valid OR harga_numeric IS NULL) AS invalid
      FROM dataset_rumah
    `);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/dataset/:id
exports.deleteRow = async (req, res) => {
  try {
    const { rowCount } = await pool.query("DELETE FROM dataset_rumah WHERE id = $1", [req.params.id]);
    if (!rowCount) return res.status(404).json({ error: "Data tidak ditemukan" });
    res.json({ message: "Data berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/dataset/:id
exports.updateRow = async (req, res) => {
  try {
    const { nama, lokasi, lt, lb, kamar_tidur, kamar_mandi, garasi, harga } = req.body;
    const { rows } = await pool.query(`
      UPDATE dataset_rumah SET
        nama = $1, lokasi = $2,
        luas_tanah_numeric = $3, luas_bangunan_numeric = $4,
        kamar_tidur = $5, kamar_mandi = $6, garasi = $7,
        harga_numeric = $8, updated_at = NOW()
      WHERE id = $9 RETURNING *
    `, [nama, lokasi, lt, lb, kamar_tidur, kamar_mandi, garasi, harga, req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "Data tidak ditemukan" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/dataset/upload — upload CSV & parse
exports.uploadCSV = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });

    const csv    = require("csv-parse/sync");
    const content = fs.readFileSync(req.file.path, "utf8");
    const records = csv.parse(content, { columns: true, skip_empty_lines: true, trim: true });

    let inserted = 0;
    let errors   = 0;

    for (const r of records) {
      try {
        await pool.query(`
          INSERT INTO dataset_rumah
            (nama, harga, lokasi, kamar_tidur, kamar_mandi, garasi,
             harga_numeric, luas_tanah_numeric, luas_bangunan_numeric,
             kamar_tidur_numeric, kamar_mandi_numeric, is_valid)
          VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
        `, [
          r.NAMA || r.nama,
          r.HARGA || r.harga,
          r.LOKASI || r.lokasi,
          parseFloat(r.KAMAR_TIDUR || r.kamar_tidur) || null,
          parseFloat(r.KAMAR_MANDI || r.kamar_mandi) || null,
          parseFloat(r.GARASI || r.garasi) || null,
          parseFloat(r.HARGA_NUMERIC || r.harga_numeric) || null,
          parseFloat(r.LUAS_TANAH_NUMERIC || r.luas_tanah_numeric) || null,
          parseFloat(r.LUAS_BANGUNAN_NUMERIC || r.luas_bangunan_numeric) || null,
          parseFloat(r.KAMAR_TIDUR_NUMERIC || r.kamar_tidur_numeric) || null,
          parseFloat(r.KAMAR_MANDI_NUMERIC || r.kamar_mandi_numeric) || null,
          !!(r.HARGA_NUMERIC || r.harga_numeric),
        ]);
        inserted++;
      } catch {
        errors++;
      }
    }

    fs.unlinkSync(req.file.path); // hapus file temp
    res.json({ message: `Import selesai: ${inserted} baris berhasil, ${errors} error`, inserted, errors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
