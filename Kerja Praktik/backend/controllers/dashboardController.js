const pool = require("../db");

// GET /api/dashboard/stats
exports.getStats = async (_req, res) => {
  try {
    const [total, prediksi, model, hargaLokasi, distribusi, tren] = await Promise.all([
      // Total dataset & harga rata-rata
      pool.query(`
        SELECT
          COUNT(*) FILTER (WHERE is_valid)            AS total_dataset,
          COUNT(*) FILTER (WHERE NOT is_valid OR harga_numeric IS NULL) AS invalid,
          ROUND(AVG(harga_numeric) FILTER (WHERE is_valid)::NUMERIC, 0) AS rata_rata_harga
        FROM dataset_rumah
      `),

      // Total prediksi
      pool.query("SELECT COUNT(*) AS total_prediksi FROM riwayat_prediksi"),

      // Model aktif
      pool.query("SELECT model_name, r2_score, mae, rmse FROM model_metrics WHERE is_active LIMIT 1"),

      // Harga per lokasi top 10
      pool.query(`
        SELECT
          SPLIT_PART(lokasi, ',', 1)                        AS lokasi,
          ROUND(AVG(harga_numeric)::NUMERIC / 1e9, 2)       AS rata,
          ROUND(MIN(harga_numeric)::NUMERIC / 1e9, 2)       AS min,
          ROUND(MAX(harga_numeric)::NUMERIC / 1e9, 2)       AS max,
          COUNT(*)                                            AS jumlah
        FROM dataset_rumah
        WHERE is_valid AND harga_numeric IS NOT NULL
        GROUP BY SPLIT_PART(lokasi, ',', 1)
        ORDER BY rata DESC LIMIT 10
      `),

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
        GROUP BY range_harga
        ORDER BY MIN(harga_numeric)
      `),

      // Tren bulanan prediksi (12 bulan)
      pool.query(`
        SELECT
          TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') AS bulan,
          ROUND(AVG(harga_prediksi)::NUMERIC / 1e9, 2)   AS prediksi,
          COUNT(*)                                         AS total
        FROM riwayat_prediksi
        WHERE created_at >= NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY DATE_TRUNC('month', created_at)
      `),
    ]);

    // Lokasi termahal & termurah
    const lokasiStats = hargaLokasi.rows;
    const termahal = lokasiStats[0] || null;
    const termurah = lokasiStats[lokasiStats.length - 1] || null;

    res.json({
      stats: {
        ...total.rows[0],
        total_prediksi: prediksi.rows[0].total_prediksi,
        daerah_termahal: termahal?.lokasi,
        daerah_termurah: termurah?.lokasi,
      },
      model_aktif: model.rows[0] || null,
      harga_per_lokasi: lokasiStats,
      distribusi_harga: distribusi.rows,
      tren_bulanan: tren.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
