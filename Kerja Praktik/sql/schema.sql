-- ============================================================
--  DATABASE: db_rumah_bandung
--  PostgreSQL Schema — Sistem Prediksi Harga Rumah Bandung
-- ============================================================

-- Ekstensi
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─────────────────────────────────────────────
--  1. TABEL USERS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  nama          VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  role          VARCHAR(20)   NOT NULL DEFAULT 'user'  CHECK (role IN ('admin','user')),
  status        VARCHAR(20)   NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif','nonaktif')),
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  2. TABEL DATASET (rumah Bandung)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dataset_rumah (
  id                   SERIAL PRIMARY KEY,
  nama                 TEXT,
  harga                VARCHAR(100),
  lokasi               VARCHAR(200),
  luas_tanah           VARCHAR(50),
  luas_bangunan        VARCHAR(50),
  kamar_tidur          SMALLINT,
  kamar_mandi          SMALLINT,
  sertifikat           VARCHAR(50),
  daya_listrik         VARCHAR(50),
  garasi               SMALLINT,
  jumlah_lantai        SMALLINT,
  deskripsi            TEXT,
  harga_numeric        BIGINT,
  luas_tanah_numeric   NUMERIC(10,2),
  luas_bangunan_numeric NUMERIC(10,2),
  kamar_tidur_numeric  SMALLINT,
  kamar_mandi_numeric  SMALLINT,
  is_valid             BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Index untuk pencarian & filter cepat
CREATE INDEX IF NOT EXISTS idx_dataset_lokasi       ON dataset_rumah (lokasi);
CREATE INDEX IF NOT EXISTS idx_dataset_harga        ON dataset_rumah (harga_numeric);
CREATE INDEX IF NOT EXISTS idx_dataset_valid        ON dataset_rumah (is_valid);

-- ─────────────────────────────────────────────
--  3. TABEL RIWAYAT PREDIKSI
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS riwayat_prediksi (
  id              SERIAL PRIMARY KEY,
  kode            VARCHAR(20)   NOT NULL UNIQUE,  -- e.g. PRD-0001
  user_id         INTEGER       REFERENCES users(id) ON DELETE SET NULL,
  lokasi          VARCHAR(200)  NOT NULL,
  luas_tanah      NUMERIC(10,2) NOT NULL,
  luas_bangunan   NUMERIC(10,2) NOT NULL,
  kamar_tidur     SMALLINT      NOT NULL,
  kamar_mandi     SMALLINT      NOT NULL,
  garasi          SMALLINT      NOT NULL DEFAULT 0,
  fasilitas       TEXT[],                          -- array fasilitas tambahan
  harga_prediksi  BIGINT        NOT NULL,
  harga_min       BIGINT,
  harga_max       BIGINT,
  confidence      NUMERIC(5,2),
  model_digunakan VARCHAR(30)   NOT NULL DEFAULT 'RFR',
  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prediksi_user    ON riwayat_prediksi (user_id);
CREATE INDEX IF NOT EXISTS idx_prediksi_lokasi  ON riwayat_prediksi (lokasi);
CREATE INDEX IF NOT EXISTS idx_prediksi_created ON riwayat_prediksi (created_at DESC);

-- Sequence untuk kode PRD-XXXX
CREATE SEQUENCE IF NOT EXISTS prediksi_kode_seq START 1001;

-- ─────────────────────────────────────────────
--  4. TABEL MODEL METRICS (hasil evaluasi)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS model_metrics (
  id          SERIAL PRIMARY KEY,
  model_name  VARCHAR(30)   NOT NULL,  -- RFR, DTR, MLR, Ensemble
  r2_score    NUMERIC(6,4)  NOT NULL,
  mae         NUMERIC(12,2) NOT NULL,
  rmse        NUMERIC(12,2) NOT NULL,
  mape        NUMERIC(6,4),
  cv_score    NUMERIC(6,4),
  dataset_size INTEGER,
  is_active   BOOLEAN      NOT NULL DEFAULT FALSE,
  trained_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  notes       TEXT
);

CREATE INDEX IF NOT EXISTS idx_model_name   ON model_metrics (model_name);
CREATE INDEX IF NOT EXISTS idx_model_active ON model_metrics (is_active);

-- ─────────────────────────────────────────────
--  5. TABEL RIWAYAT RETRAINING
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS riwayat_retrain (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER       REFERENCES users(id) ON DELETE SET NULL,
  model_name   VARCHAR(30)   NOT NULL,
  dataset_size INTEGER       NOT NULL,
  r2_lama      NUMERIC(6,4),
  r2_baru      NUMERIC(6,4),
  mae_baru     NUMERIC(12,2),
  rmse_baru    NUMERIC(12,2),
  durasi_detik INTEGER,
  status       VARCHAR(20)   NOT NULL DEFAULT 'sukses' CHECK (status IN ('sukses','gagal','running')),
  log_text     TEXT,
  started_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  finished_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_retrain_model  ON riwayat_retrain (model_name);
CREATE INDEX IF NOT EXISTS idx_retrain_status ON riwayat_retrain (status);

-- ─────────────────────────────────────────────
--  6. TABEL MONITORING HARIAN
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS monitoring_harian (
  id          SERIAL PRIMARY KEY,
  tanggal     DATE          NOT NULL UNIQUE,
  r2_score    NUMERIC(6,4),
  mae         NUMERIC(12,2),
  rmse        NUMERIC(12,2),
  total_req   INTEGER       NOT NULL DEFAULT 0,
  model_name  VARCHAR(30),
  drift_flag  BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_monitoring_tanggal ON monitoring_harian (tanggal DESC);

-- ─────────────────────────────────────────────
--  7. TABEL INSIGHTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS insights (
  id          SERIAL PRIMARY KEY,
  judul       VARCHAR(200)  NOT NULL,
  deskripsi   TEXT          NOT NULL,
  kategori    VARCHAR(30)   NOT NULL CHECK (kategori IN ('harga','investasi','ai','pasar')),
  trend       VARCHAR(10)   NOT NULL DEFAULT 'stabil' CHECK (trend IN ('naik','turun','stabil')),
  nilai       VARCHAR(20),
  is_published BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- ─────────────────────────────────────────────
--  8. TRIGGER: updated_at otomatis
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE TRIGGER trg_dataset_updated_at
  BEFORE UPDATE ON dataset_rumah
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─────────────────────────────────────────────
--  SEED: Admin default
-- ─────────────────────────────────────────────
-- Password default: admin123 (bcrypt hash)
INSERT INTO users (nama, email, password_hash, role, status) VALUES
  ('Administrator', 'admin@rumahbandung.id', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGmiZENjSm0gs.hGMQaYbNlSBB2', 'admin', 'aktif'),
  ('Demo User',     'user@rumahbandung.id',  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TiGmiZENjSm0gs.hGMQaYbNlSBB2', 'user',  'aktif')
ON CONFLICT (email) DO NOTHING;

-- SEED: Model metrics awal
INSERT INTO model_metrics (model_name, r2_score, mae, rmse, mape, cv_score, dataset_size, is_active, notes) VALUES
  ('MLR',      0.7210, 185000000, 240000000, 14.20, 0.6980, 9247, FALSE, 'Multiple Linear Regression baseline'),
  ('DTR',      0.7980, 145000000, 198000000, 11.80, 0.7710, 9247, FALSE, 'Decision Tree Regressor'),
  ('RFR',      0.8710,  98000000, 132000000,  7.40, 0.8580, 9247, TRUE,  'Random Forest Regressor — model aktif'),
  ('Ensemble', 0.8920,  88000000, 118000000,  6.80, 0.8790, 9247, FALSE, 'Ensemble semua model')
ON CONFLICT DO NOTHING;

-- SEED: Monitoring 14 hari terakhir
INSERT INTO monitoring_harian (tanggal, r2_score, mae, rmse, total_req, model_name)
SELECT
  CURRENT_DATE - (13 - gs)::INTEGER AS tanggal,
  ROUND((0.855 + SIN(gs * 0.4) * 0.02 + RANDOM() * 0.01)::NUMERIC, 3) AS r2_score,
  ROUND((100000000 + SIN(gs * 0.5) * 15000000 + RANDOM() * 5000000)::NUMERIC, 2) AS mae,
  ROUND((135000000 + SIN(gs * 0.45) * 18000000 + RANDOM() * 7000000)::NUMERIC, 2) AS rmse,
  FLOOR(40 + RANDOM() * 80)::INTEGER AS total_req,
  'RFR' AS model_name
FROM generate_series(0, 13) AS gs
ON CONFLICT (tanggal) DO NOTHING;

-- SEED: Insights awal
INSERT INTO insights (judul, deskripsi, kategori, trend, nilai) VALUES
  ('Dago Tetap Primadona',          'Kawasan Dago masih menjadi kawasan dengan harga properti tertinggi di Bandung, rata-rata Rp 3,2 M untuk rumah 100 m².', 'harga',    'naik',   '+8,4%'),
  ('Gedebage: Kawasan Potensial',   'Seiring perkembangan Bandung Timur dan LRT Jabodebek, harga di Gedebage naik signifikan dalam 6 bulan terakhir.',      'investasi','naik',   '+15,2%'),
  ('Lokasi Dominasi Feature Importance', 'Model RFR menunjukkan bahwa lokasi berkontribusi 38,5% terhadap prediksi harga, diikuti luas bangunan 22,3%.',    'ai',       'stabil', '38,5%'),
  ('Harga Rumah Bandung Naik 12%',  'Rata-rata harga properti di seluruh Bandung mengalami kenaikan 12% YoY, melampaui inflasi nasional sebesar 3,2%.',      'pasar',    'naik',   '+12%')
ON CONFLICT DO NOTHING;
