-- ============================================================
--  QUERY REFERENSI — db_rumah_bandung
--  Digunakan oleh backend Express.js
-- ============================================================

-- ──────────────────────────────
--  DASHBOARD
-- ──────────────────────────────

-- Stats utama dashboard
SELECT
  (SELECT COUNT(*)  FROM dataset_rumah WHERE is_valid)              AS total_dataset,
  (SELECT COUNT(*)  FROM riwayat_prediksi)                          AS total_prediksi,
  (SELECT model_name FROM model_metrics WHERE is_active LIMIT 1)    AS model_terbaik,
  (SELECT r2_score   FROM model_metrics WHERE is_active LIMIT 1)    AS r2_terbaik,
  (SELECT ROUND(AVG(harga_numeric)::NUMERIC, 0) FROM dataset_rumah WHERE is_valid) AS rata_rata_harga;

-- Harga bulanan (trend 12 bulan terakhir — dari riwayat prediksi)
SELECT
  TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') AS bulan,
  ROUND(AVG(harga_prediksi)::NUMERIC / 1e9, 2)   AS rata_prediksi
FROM riwayat_prediksi
WHERE created_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY DATE_TRUNC('month', created_at);

-- Harga rata-rata per lokasi (top 10)
SELECT
  SPLIT_PART(lokasi, ',', 1)                           AS lokasi,
  ROUND(AVG(harga_numeric)::NUMERIC / 1e9, 2)         AS rata,
  ROUND(MIN(harga_numeric)::NUMERIC / 1e9, 2)         AS min,
  ROUND(MAX(harga_numeric)::NUMERIC / 1e9, 2)         AS max,
  COUNT(*)                                              AS jumlah
FROM dataset_rumah
WHERE is_valid = TRUE AND harga_numeric IS NOT NULL
GROUP BY lokasi
ORDER BY rata DESC
LIMIT 10;

-- Lokasi termahal & termurah
SELECT
  SPLIT_PART(lokasi, ',', 1) AS lokasi,
  ROUND(AVG(harga_numeric)::NUMERIC / 1e9, 2) AS rata
FROM dataset_rumah WHERE is_valid
GROUP BY lokasi
ORDER BY rata DESC LIMIT 1;

SELECT
  SPLIT_PART(lokasi, ',', 1) AS lokasi,
  ROUND(AVG(harga_numeric)::NUMERIC / 1e9, 2) AS rata
FROM dataset_rumah WHERE is_valid
GROUP BY lokasi
ORDER BY rata ASC LIMIT 1;


-- ──────────────────────────────
--  DATASET
-- ──────────────────────────────

-- Ambil semua data dengan paginasi
SELECT id, nama, SPLIT_PART(lokasi,',',1) AS lokasi,
  luas_tanah_numeric AS lt, luas_bangunan_numeric AS lb,
  kamar_tidur, kamar_mandi, garasi, harga_numeric, is_valid
FROM dataset_rumah
ORDER BY id
LIMIT $1 OFFSET $2;

-- Total count
SELECT COUNT(*) FROM dataset_rumah;
SELECT COUNT(*) FROM dataset_rumah WHERE is_valid = TRUE;
SELECT COUNT(*) FROM dataset_rumah WHERE is_valid = FALSE OR harga_numeric IS NULL;

-- Cari berdasarkan lokasi
SELECT id, nama, lokasi, luas_tanah_numeric, luas_bangunan_numeric,
  kamar_tidur, kamar_mandi, garasi, harga_numeric, is_valid
FROM dataset_rumah
WHERE LOWER(SPLIT_PART(lokasi,',',1)) ILIKE '%' || $1 || '%'
ORDER BY id
LIMIT $2 OFFSET $3;

-- Distribusi harga
SELECT
  CASE
    WHEN harga_numeric < 500000000            THEN '< 500 Jt'
    WHEN harga_numeric < 1000000000           THEN '500Jt – 1M'
    WHEN harga_numeric < 1500000000           THEN '1M – 1.5M'
    WHEN harga_numeric < 2000000000           THEN '1.5M – 2M'
    WHEN harga_numeric < 3000000000           THEN '2M – 3M'
    WHEN harga_numeric < 5000000000           THEN '3M – 5M'
    ELSE '> 5M'
  END AS range_harga,
  COUNT(*) AS jumlah
FROM dataset_rumah
WHERE is_valid = TRUE AND harga_numeric IS NOT NULL
GROUP BY range_harga
ORDER BY MIN(harga_numeric);

-- Hapus satu data
DELETE FROM dataset_rumah WHERE id = $1;

-- Update data
UPDATE dataset_rumah SET
  nama = $1, lokasi = $2,
  luas_tanah_numeric = $3, luas_bangunan_numeric = $4,
  kamar_tidur = $5, kamar_mandi = $6, garasi = $7,
  harga_numeric = $8, updated_at = NOW()
WHERE id = $9 RETURNING *;


-- ──────────────────────────────
--  RIWAYAT PREDIKSI
-- ──────────────────────────────

-- List riwayat dengan info user
SELECT
  rp.id, rp.kode, rp.created_at,
  u.nama AS user_nama,
  rp.lokasi, rp.luas_tanah AS lt, rp.luas_bangunan AS lb,
  rp.kamar_tidur AS kt, rp.kamar_mandi AS km,
  rp.garasi, rp.fasilitas,
  rp.harga_prediksi, rp.harga_min, rp.harga_max,
  rp.confidence, rp.model_digunakan
FROM riwayat_prediksi rp
LEFT JOIN users u ON u.id = rp.user_id
ORDER BY rp.created_at DESC
LIMIT $1 OFFSET $2;

-- Count per model
SELECT model_digunakan, COUNT(*) AS jumlah
FROM riwayat_prediksi
GROUP BY model_digunakan;

-- Insert prediksi baru
INSERT INTO riwayat_prediksi
  (kode, user_id, lokasi, luas_tanah, luas_bangunan,
   kamar_tidur, kamar_mandi, garasi, fasilitas,
   harga_prediksi, harga_min, harga_max, confidence, model_digunakan)
VALUES
  ('PRD-' || LPAD(nextval('prediksi_kode_seq')::TEXT, 4, '0'),
   $1, $2, $3, $4, $5, $6, $7, $8::TEXT[], $9, $10, $11, $12, $13)
RETURNING *;


-- ──────────────────────────────
--  MODEL METRICS
-- ──────────────────────────────

-- Semua metrik model
SELECT id, model_name, r2_score, mae, rmse, mape, cv_score,
  dataset_size, is_active, trained_at, notes
FROM model_metrics
ORDER BY r2_score DESC;

-- Model aktif
SELECT * FROM model_metrics WHERE is_active = TRUE LIMIT 1;

-- Set model aktif baru (non-aktifkan semua lalu aktifkan satu)
UPDATE model_metrics SET is_active = FALSE;
UPDATE model_metrics SET is_active = TRUE WHERE model_name = $1;

-- Insert metrik baru setelah retrain
INSERT INTO model_metrics
  (model_name, r2_score, mae, rmse, mape, cv_score, dataset_size, is_active, notes)
VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, $8)
RETURNING *;


-- ──────────────────────────────
--  RETRAINING
-- ──────────────────────────────

-- Insert log retrain baru (status running)
INSERT INTO riwayat_retrain (user_id, model_name, dataset_size, r2_lama, status, started_at)
VALUES ($1, $2, $3, $4, 'running', NOW())
RETURNING id;

-- Update setelah selesai
UPDATE riwayat_retrain SET
  r2_baru     = $1,
  mae_baru    = $2,
  rmse_baru   = $3,
  durasi_detik= $4,
  status      = $5,
  log_text    = $6,
  finished_at = NOW()
WHERE id = $7;

-- Daftar riwayat retrain
SELECT rr.*, u.nama AS user_nama
FROM riwayat_retrain rr
LEFT JOIN users u ON u.id = rr.user_id
ORDER BY rr.started_at DESC
LIMIT 10;


-- ──────────────────────────────
--  MONITORING
-- ──────────────────────────────

-- 14 hari terakhir
SELECT tanggal, r2_score, mae, rmse, total_req, model_name, drift_flag
FROM monitoring_harian
ORDER BY tanggal DESC
LIMIT 14;

-- Upsert data monitoring hari ini
INSERT INTO monitoring_harian (tanggal, r2_score, mae, rmse, total_req, model_name, drift_flag)
VALUES (CURRENT_DATE, $1, $2, $3, $4, $5, $6)
ON CONFLICT (tanggal) DO UPDATE SET
  r2_score   = EXCLUDED.r2_score,
  mae        = EXCLUDED.mae,
  rmse       = EXCLUDED.rmse,
  total_req  = monitoring_harian.total_req + EXCLUDED.total_req,
  drift_flag = EXCLUDED.drift_flag;


-- ──────────────────────────────
--  ANALISIS
-- ──────────────────────────────

-- Korelasi Pearson: luas_tanah vs harga
SELECT CORR(luas_tanah_numeric, harga_numeric) AS corr_luas_tanah
FROM dataset_rumah WHERE is_valid;

SELECT CORR(luas_bangunan_numeric, harga_numeric) AS corr_luas_bangunan
FROM dataset_rumah WHERE is_valid;

SELECT CORR(kamar_tidur_numeric, harga_numeric) AS corr_kamar_tidur
FROM dataset_rumah WHERE is_valid;

-- Scatter data sample (100 titik)
SELECT luas_tanah_numeric AS lt, ROUND(harga_numeric::NUMERIC / 1e9, 2) AS harga
FROM dataset_rumah
WHERE is_valid AND luas_tanah_numeric IS NOT NULL AND harga_numeric IS NOT NULL
ORDER BY RANDOM() LIMIT 100;


-- ──────────────────────────────
--  USERS
-- ──────────────────────────────

-- Semua user
SELECT id, nama, email, role, status,
  (SELECT COUNT(*) FROM riwayat_prediksi rp WHERE rp.user_id = u.id) AS total_prediksi,
  created_at
FROM users u
ORDER BY created_at DESC;

-- Login
SELECT id, nama, email, password_hash, role, status
FROM users
WHERE email = $1 AND status = 'aktif';

-- Register user baru
INSERT INTO users (nama, email, password_hash, role)
VALUES ($1, $2, $3, 'user')
RETURNING id, nama, email, role, status, created_at;

-- Toggle status user
UPDATE users SET status = CASE WHEN status = 'aktif' THEN 'nonaktif' ELSE 'aktif' END
WHERE id = $1
RETURNING *;

-- Reset password
UPDATE users SET password_hash = $1, updated_at = NOW()
WHERE id = $2;


-- ──────────────────────────────
--  INSIGHTS
-- ──────────────────────────────

SELECT id, judul, deskripsi, kategori, trend, nilai, created_at
FROM insights
WHERE is_published = TRUE
ORDER BY created_at DESC;
