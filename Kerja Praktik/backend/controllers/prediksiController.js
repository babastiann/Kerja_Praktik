const pool  = require("../db");
const axios = require("axios");

const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// POST /api/prediksi — prediksi harga
exports.predict = async (req, res) => {
  try {
    const { lokasi, luas_tanah, luas_bangunan, kamar_tidur, kamar_mandi, garasi, fasilitas, model } = req.body;

    // Validasi input
    if (!lokasi || !luas_tanah || !luas_bangunan) {
      return res.status(400).json({ error: "Lokasi, luas tanah, dan luas bangunan wajib diisi" });
    }

    // Panggil Python ML service
    const mlRes = await axios.post(`${ML_URL}/predict`, {
      lokasi,
      luas_tanah:    parseFloat(luas_tanah),
      luas_bangunan: parseFloat(luas_bangunan),
      kamar_tidur:   parseInt(kamar_tidur)   || 3,
      kamar_mandi:   parseInt(kamar_mandi)   || 2,
      garasi:        parseInt(garasi)         || 1,
      fasilitas:     fasilitas || [],
      model:         model || "RFR",
    });

    const { harga_prediksi, harga_min, harga_max, confidence, model_digunakan } = mlRes.data;

    // Simpan ke riwayat
    const user_id = req.user?.id || null;
    const { rows } = await pool.query(`
      INSERT INTO riwayat_prediksi
        (kode, user_id, lokasi, luas_tanah, luas_bangunan,
         kamar_tidur, kamar_mandi, garasi, fasilitas,
         harga_prediksi, harga_min, harga_max, confidence, model_digunakan)
      VALUES
        ('PRD-' || LPAD(nextval('prediksi_kode_seq')::TEXT, 4, '0'),
         $1,$2,$3,$4,$5,$6,$7,$8::TEXT[],$9,$10,$11,$12,$13)
      RETURNING *
    `, [
      user_id, lokasi,
      parseFloat(luas_tanah), parseFloat(luas_bangunan),
      parseInt(kamar_tidur) || 3, parseInt(kamar_mandi) || 2, parseInt(garasi) || 1,
      fasilitas || [],
      harga_prediksi, harga_min, harga_max, confidence, model_digunakan,
    ]);

    // Update monitoring count hari ini
    await pool.query(`
      INSERT INTO monitoring_harian (tanggal, total_req, model_name)
      VALUES (CURRENT_DATE, 1, $1)
      ON CONFLICT (tanggal) DO UPDATE
        SET total_req = monitoring_harian.total_req + 1
    `, [model_digunakan]);

    res.json({ ...mlRes.data, kode: rows[0].kode, id: rows[0].id });
  } catch (err) {
    if (err.code === "ECONNREFUSED") {
      return res.status(503).json({ error: "ML service tidak tersedia" });
    }
    res.status(500).json({ error: err.message });
  }
};

// GET /api/prediksi/riwayat
exports.getRiwayat = async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page) || 1);
    const limit  = Math.min(100, parseInt(req.query.limit) || 30);
    const offset = (page - 1) * limit;
    const model  = req.query.model;
    const search = req.query.search || "";

    let where = "WHERE 1=1";
    const params = [];

    if (model && model !== "Semua") {
      params.push(model);
      where += ` AND rp.model_digunakan = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      where += ` AND (LOWER(rp.lokasi) ILIKE $${params.length} OR rp.kode ILIKE $${params.length})`;
    }

    params.push(limit, offset);

    const { rows } = await pool.query(`
      SELECT
        rp.id, rp.kode, rp.created_at,
        COALESCE(u.nama, 'Anonim') AS user_nama,
        rp.lokasi, rp.luas_tanah AS lt, rp.luas_bangunan AS lb,
        rp.kamar_tidur AS kt, rp.kamar_mandi AS km, rp.garasi,
        rp.harga_prediksi, rp.confidence, rp.model_digunakan
      FROM riwayat_prediksi rp
      LEFT JOIN users u ON u.id = rp.user_id
      ${where}
      ORDER BY rp.created_at DESC
      LIMIT $${params.length - 1} OFFSET $${params.length}
    `, params);

    const countParams = params.slice(0, params.length - 2);
    const countRes = await pool.query(
      `SELECT COUNT(*) FROM riwayat_prediksi rp ${where}`,
      countParams
    );

    // Summary per model
    const summary = await pool.query(`
      SELECT model_digunakan, COUNT(*) AS jumlah
      FROM riwayat_prediksi GROUP BY model_digunakan
    `);

    res.json({
      data:   rows,
      total:  parseInt(countRes.rows[0].count),
      page, limit,
      summary: summary.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
