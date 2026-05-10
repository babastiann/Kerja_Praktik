const pool = require("../db");

// GET /api/monitoring — 14 hari terakhir + stats model
exports.getMonitoring = async (_req, res) => {
  try {
    const [harian, modelHealth] = await Promise.all([
      pool.query(`
        SELECT tanggal,
          CAST(r2_score AS FLOAT)  AS r2,
          ROUND(mae::NUMERIC / 1e6, 1)  AS mae,
          ROUND(rmse::NUMERIC / 1e6, 1) AS rmse,
          total_req AS req,
          model_name, drift_flag,
          TO_CHAR(tanggal, 'DD/MM') AS hari
        FROM monitoring_harian
        ORDER BY tanggal DESC LIMIT 14
      `),
      pool.query(`
        SELECT model_name AS model, r2_score AS r2,
          ROUND(mae::NUMERIC / 1e6, 0) AS mae,
          ROUND(rmse::NUMERIC / 1e6, 0) AS rmse,
          cv_score AS cv, is_active
        FROM model_metrics ORDER BY r2_score DESC
      `),
    ]);

    const data = harian.rows.reverse(); // cronologis
    const latest = data[data.length - 1] || {};
    const prev   = data[data.length - 2] || {};

    res.json({
      harian:   data,
      latest,
      drift:    latest.r2 && prev.r2 ? (latest.r2 - prev.r2).toFixed(3) : "0",
      model_health: modelHealth.rows,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
