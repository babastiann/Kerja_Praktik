// ============================================================
//  modelController.js — Manajemen Model ML
// ============================================================
const pool = require("../db");

exports.getAll = async (_req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, model_name, r2_score, mae, rmse, mape, cv_score, dataset_size, is_active, trained_at, notes FROM model_metrics ORDER BY r2_score DESC"
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getActive = async (_req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM model_metrics WHERE is_active LIMIT 1");
    res.json(rows[0] || null);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.setActive = async (req, res) => {
  try {
    const { model_name } = req.body;
    await pool.query("UPDATE model_metrics SET is_active = FALSE");
    const { rows } = await pool.query(
      "UPDATE model_metrics SET is_active = TRUE WHERE model_name = $1 RETURNING *",
      [model_name]
    );
    if (!rows.length) return res.status(404).json({ error: "Model tidak ditemukan" });
    res.json({ message: `Model ${model_name} sekarang aktif`, model: rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getR2History = async (_req, res) => {
  try {
    // Ambil dari monitoring harian yang menyimpan r2 per hari per model
    const { rows } = await pool.query(`
      SELECT
        TO_CHAR(tanggal, 'Mon') AS bulan,
        model_name,
        ROUND(AVG(r2_score)::NUMERIC, 3) AS r2
      FROM monitoring_harian
      WHERE tanggal >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', tanggal), TO_CHAR(tanggal, 'Mon'), model_name
      ORDER BY DATE_TRUNC('month', tanggal)
    `);

    // Gabungkan ke format { bulan, RFR, DTR, MLR, Ensemble }
    const map = {};
    for (const r of rows) {
      if (!map[r.bulan]) map[r.bulan] = { bulan: r.bulan };
      map[r.bulan][r.model_name] = parseFloat(r.r2);
    }
    res.json(Object.values(map));
  } catch (err) { res.status(500).json({ error: err.message }); }
};
