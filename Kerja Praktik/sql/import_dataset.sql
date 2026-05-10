-- ============================================================
--  IMPORT DATASET CSV ke tabel dataset_rumah
--  Jalankan di psql setelah schema.sql
-- ============================================================

-- 1. Buat tabel staging sementara
CREATE TEMP TABLE staging_rumah (
  nama                  TEXT,
  harga                 TEXT,
  lokasi                TEXT,
  luas_tanah            TEXT,
  luas_bangunan         TEXT,
  kamar_tidur           TEXT,
  kamar_mandi           TEXT,
  sertifikat            TEXT,
  daya_listrik          TEXT,
  garasi                TEXT,
  jumlah_lantai         TEXT,
  deskripsi             TEXT,
  harga_numeric         TEXT,
  luas_tanah_numeric    TEXT,
  luas_bangunan_numeric TEXT,
  kamar_tidur_numeric   TEXT,
  kamar_mandi_numeric   TEXT
);

-- 2. Import CSV (sesuaikan path file)
-- Pastikan file dataset_bandung_clean.csv ada di server PostgreSQL atau gunakan \copy dari psql client
\copy staging_rumah FROM 'dataset_bandung_clean.csv' WITH (FORMAT CSV, HEADER true, ENCODING 'UTF8');

-- 3. Pindahkan ke tabel utama dengan type casting
INSERT INTO dataset_rumah (
  nama, harga, lokasi, luas_tanah, luas_bangunan,
  kamar_tidur, kamar_mandi, sertifikat, daya_listrik, garasi,
  jumlah_lantai, deskripsi, harga_numeric,
  luas_tanah_numeric, luas_bangunan_numeric,
  kamar_tidur_numeric, kamar_mandi_numeric, is_valid
)
SELECT
  nama,
  harga,
  -- Normalisasi lokasi: ambil nama kecamatan saja
  SPLIT_PART(lokasi, ',', 1)   AS lokasi,
  luas_tanah,
  luas_bangunan,
  NULLIF(kamar_tidur, '')::SMALLINT,
  NULLIF(kamar_mandi, '')::SMALLINT,
  sertifikat,
  daya_listrik,
  NULLIF(garasi, '')::SMALLINT,
  NULLIF(jumlah_lantai, '')::SMALLINT,
  deskripsi,
  NULLIF(harga_numeric, '')::BIGINT,
  NULLIF(luas_tanah_numeric, '')::NUMERIC,
  NULLIF(luas_bangunan_numeric, '')::NUMERIC,
  NULLIF(kamar_tidur_numeric, '')::SMALLINT,
  NULLIF(kamar_mandi_numeric, '')::SMALLINT,
  -- Tandai valid jika data utama lengkap
  (
    NULLIF(harga_numeric, '') IS NOT NULL AND
    NULLIF(luas_tanah_numeric, '') IS NOT NULL AND
    NULLIF(luas_bangunan_numeric, '') IS NOT NULL
  ) AS is_valid
FROM staging_rumah;

-- 4. Laporan import
SELECT
  COUNT(*)                          AS total_imported,
  COUNT(*) FILTER (WHERE is_valid)  AS valid_rows,
  COUNT(*) FILTER (WHERE NOT is_valid) AS invalid_rows
FROM dataset_rumah;

-- 5. Statistik per lokasi (untuk verifikasi)
SELECT
  SPLIT_PART(lokasi, ',', 1) AS kecamatan,
  COUNT(*)                   AS jumlah,
  ROUND(AVG(harga_numeric)::NUMERIC / 1e9, 2) AS rata_rata_miliar,
  ROUND(MIN(harga_numeric)::NUMERIC / 1e9, 2) AS min_miliar,
  ROUND(MAX(harga_numeric)::NUMERIC / 1e9, 2) AS max_miliar
FROM dataset_rumah
WHERE is_valid = TRUE
GROUP BY kecamatan
ORDER BY rata_rata_miliar DESC
LIMIT 20;
