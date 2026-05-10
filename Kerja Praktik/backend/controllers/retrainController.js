const pool  = require("../db");
const axios = require("axios");

const ML_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// POST /api/retrain — mulai retraining
exports.startRetrain = async (req, res) => {
  try {
    const { model_name } = req.body;
    if (!model_name) return res.status(400).json({ error: "model_name wajib diisi" });

    // Ambil r2 lama
    const { rows: existing } = await pool.query(
      "SELECT r2_score FROM model_metrics WHERE model_name = $1 LIMIT 1", [model_name]
    );
    const r2Lama = existing[0]?.r2_score || null;

    // Total dataset valid
    const { rows: dsCnt } = await pool.query(
      "SELECT COUNT(*) AS c FROM dataset_rumah WHERE is_valid"
    );
    const datasetSize = parseInt(dsCnt[0].c);

    // Insert log retrain (status: running)
    const { rows: log } = await pool.query(`
      INSERT INTO riwayat_retrain (user_id, model_name, dataset_size, r2_lama, status)
      VALUES ($1, $2, $3, $4, 'running') RETURNING id
    `, [req.user?.id || null, model_name, datasetSize, r2Lama]);
    const retrainId = log[0].id;

    // Panggil Python ML service (async — tidak menunggu selesai)
    const startTime = Date.now();
    axios.post(`${ML_URL}/retrain`, { model_name, retrain_id: retrainId })
      .then(async (mlRes) => {
        const durasi = Math.round((Date.now() - startTime) / 1000);
        const { r2_baru, mae_baru, rmse_baru } = mlRes.data;

        await pool.query(`
          UPDATE riwayat_retrain SET
            r2_baru = $1, mae_baru = $2, rmse_baru = $3,
            durasi_detik = $4, status = 'sukses', finished_at = NOW()
          WHERE id = $5
        `, [r2_baru, mae_baru, rmse_baru, durasi, retrainId]);

        // Update model_metrics
        await pool.query(`
          UPDATE model_metrics SET r2_score = $1, mae = $2, rmse = $3,
            dataset_size = $4, trained_at = NOW()
          WHERE model_name = $5
        `, [r2_baru, mae_baru, rmse_baru, datasetSize, model_name]);
      })
      .catch(async () => {
        await pool.query(
          "UPDATE riwayat_retrain SET status = 'gagal', finished_at = NOW() WHERE id = $1",
          [retrainId]
        );
      });

    res.json({ message: "Retraining dimulai", retrain_id: retrainId, model_name });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/retrain/status/:id
exports.getStatus = async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM riwayat_retrain WHERE id = $1", [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: "Retrain ID tidak ditemukan" });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// GET /api/retrain/history
exports.getHistory = async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT rr.id,
        TO_CHAR(rr.started_at, 'DD Mon YYYY') AS tanggal,
        rr.model_name AS model,
        rr.dataset_size || ' rows'            AS dataset,
        rr.r2_lama, rr.r2_baru,
        CASE
          WHEN rr.durasi_detik IS NULL THEN '-'
          WHEN rr.durasi_detik < 60 THEN rr.durasi_detik || 's'
          ELSE (rr.durasi_detik / 60) || 'm ' || (rr.durasi_detik % 60) || 's'
        END AS durasi,
        rr.status,
        COALESCE(u.nama, 'Sistem') AS user_nama
      FROM riwayat_retrain rr
      LEFT JOIN users u ON u.id = rr.user_id
      ORDER BY rr.started_at DESC
      LIMIT 10
    `);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
