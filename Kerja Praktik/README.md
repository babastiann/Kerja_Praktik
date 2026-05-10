# Sistem Prediksi Harga Rumah Bandung — Setup Guide

## Struktur Proyek

```
Kerja Praktik/
├── frontend/          ← React + Vite (sudah ada)
├── backend/           ← Node.js Express API
│   ├── server.js
│   ├── db.js
│   ├── .env
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── datasetController.js
│   │   ├── prediksiController.js
│   │   ├── modelController.js
│   │   ├── monitoringController.js
│   │   ├── retrainController.js
│   │   └── otherControllers.js  ← users, insight, analisis
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── datasetRoutes.js
│   │   ├── prediksiRoutes.js
│   │   ├── modelRoutes.js
│   │   ├── monitoringRoutes.js
│   │   ├── retrainRoutes.js
│   │   ├── insightRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── analisisRoutes.js
│   ├── middleware/
│   │   └── auth.js
│   └── ml/
│       └── ml_service.py   ← Python FastAPI
├── models/
│   ├── model_rumah_bandung.pkl
│   ├── scaler_rumah_bandung.pkl
│   └── fitur_model.pkl
├── dataset_bandung_clean.csv
└── sql/
    ├── schema.sql          ← Buat tabel & seed data
    ├── import_dataset.sql  ← Import CSV ke DB
    └── queries.sql         ← Query referensi
```

---

## 1. Setup Database PostgreSQL

```bash
# Buat database
psql -U postgres -c "CREATE DATABASE db_rumah_bandung;"

# Jalankan schema (buat tabel + seed)
psql -U postgres -d db_rumah_bandung -f sql/schema.sql

# Import dataset CSV (pastikan path csv benar)
psql -U postgres -d db_rumah_bandung -f sql/import_dataset.sql
```

> **Catatan:** Sesuaikan `DB_PASSWORD` di `.env` dengan password PostgreSQL Anda.

---

## 2. Setup Backend Node.js

```bash
cd backend
npm install
```

Edit `.env` jika perlu, lalu:

```bash
# Development (dengan auto-reload)
npm run dev

# Production
npm start
```

Backend berjalan di: `http://localhost:5000`

---

## 3. Setup Python ML Service

```bash
cd backend
pip install fastapi uvicorn scikit-learn pandas numpy joblib

# Jalankan service
uvicorn ml.ml_service:app --host 0.0.0.0 --port 8000 --reload
```

ML Service berjalan di: `http://localhost:8000`

---

## 4. Jalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di: `http://localhost:5173`

---

## API Endpoints

| Method | Endpoint                   | Deskripsi                     | Auth |
|--------|----------------------------|-------------------------------|------|
| POST   | /api/auth/login            | Login user                    | ✗    |
| POST   | /api/auth/register         | Registrasi user baru          | ✗    |
| GET    | /api/auth/me               | Info user aktif               | ✓    |
| GET    | /api/dashboard/stats       | Statistik dashboard           | ✓    |
| GET    | /api/dataset               | List dataset (paginasi+search)| ✓    |
| GET    | /api/dataset/stats         | Total/valid/invalid           | ✓    |
| POST   | /api/dataset/upload        | Upload CSV dataset            | Admin|
| PUT    | /api/dataset/:id           | Edit baris dataset            | Admin|
| DELETE | /api/dataset/:id           | Hapus baris dataset           | Admin|
| POST   | /api/prediksi              | Prediksi harga                | ✓    |
| GET    | /api/prediksi/riwayat      | Riwayat prediksi              | ✓    |
| GET    | /api/model                 | Semua model metrics           | ✓    |
| GET    | /api/model/active          | Model aktif                   | ✓    |
| POST   | /api/model/set-active      | Ganti model aktif             | Admin|
| GET    | /api/monitoring            | Data monitoring 14 hari       | ✓    |
| POST   | /api/retrain               | Mulai retraining              | Admin|
| GET    | /api/retrain/history       | Riwayat retraining            | ✓    |
| GET    | /api/retrain/status/:id    | Status retrain                | ✓    |
| GET    | /api/users                 | Daftar user                   | Admin|
| POST   | /api/users                 | Tambah user                   | Admin|
| PATCH  | /api/users/:id/status      | Toggle aktif/nonaktif         | Admin|
| PATCH  | /api/users/:id/password    | Reset password                | Admin|
| GET    | /api/insight               | List insight                  | ✓    |
| GET    | /api/analisis              | Data analisis                 | ✓    |

---

## Akun Default

| Role  | Email                    | Password  |
|-------|--------------------------|-----------|
| Admin | admin@rumahbandung.id    | admin123  |
| User  | user@rumahbandung.id     | admin123  |

---

## Cara Integrasi ke Frontend

Di setiap page React, ganti import dari `mockData.js` dengan `fetch` ke API:

```js
// Contoh di Dashboard.jsx
useEffect(() => {
  fetch("http://localhost:5000/api/dashboard/stats", {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(r => r.json())
    .then(data => setStats(data));
}, []);
```

Simpan token JWT di `localStorage` setelah login berhasil.
