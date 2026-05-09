# 🏠 RumahAI — Dashboard Prediksi Harga Properti Bandung

AI-powered real estate analytics platform untuk prediksi harga rumah di Kota Bandung.

---

## 📁 Struktur Folder

```
rumah-ai/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.jsx        # Root layout (sidebar + topbar + outlet)
│   │   │   ├── Sidebar.jsx       # Navigasi sidebar dengan NavLink
│   │   │   └── Topbar.jsx        # Header dengan breadcrumb & notifikasi
│   │   └── ui/
│   │       └── index.jsx         # StatCard, SectionHeader, MetricBar, Tabs, ProgressRing, dll
│   ├── data/
│   │   └── mockData.js           # Semua data dummy (dataset, model metrics, dll)
│   ├── pages/
│   │   ├── Dashboard.jsx         # Halaman utama dengan overview stats
│   │   ├── Prediksi.jsx          # Form prediksi harga rumah + hasil AI
│   │   ├── Analisis.jsx          # Analisis data (distribusi, korelasi, pie chart)
│   │   ├── Model.jsx             # Perbandingan model MLR/DTR/RFR/Ensemble
│   │   ├── Monitoring.jsx        # Monitoring performa model AI real-time
│   │   ├── Dataset.jsx           # Manajemen dataset + upload CSV
│   │   ├── Users.jsx             # Manajemen user & role
│   │   ├── Retrain.jsx           # Retrain model dengan live log
│   │   ├── Riwayat.jsx           # Riwayat semua prediksi user
│   │   └── Insight.jsx           # Insight & rekomendasi properti Bandung
│   ├── App.jsx                   # Router utama
│   ├── main.jsx                  # Entry point React
│   └── index.css                 # Tailwind + custom CSS utilities
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

---

## 🚀 Cara Menjalankan

### 1. Masuk ke folder project
```bash
cd rumah-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Jalankan development server
```bash
npm run dev
```

### 4. Buka di browser
```
http://localhost:5173
```

---

## 🏗️ Build untuk Production
```bash
npm run build
npm run preview
```

---

## 🎨 Tech Stack

| Bagian     | Teknologi                     |
|------------|-------------------------------|
| Framework  | React 18 + Vite               |
| Styling    | Tailwind CSS 3                |
| Routing    | React Router DOM v6           |
| Charts     | Recharts                      |
| Icons      | Lucide React                  |
| Fonts      | Syne + DM Sans + JetBrains Mono |

---

## 📌 Fitur Frontend

- ✅ **Dashboard Utama** — Statistik overview, trend harga, feature importance
- ✅ **Prediksi Harga** — Form input properti + confidence score + insight AI
- ✅ **Analisis Data** — Distribusi, pie chart, scatter plot, korelasi heatmap
- ✅ **Perbandingan Model** — Radar chart, line chart, tabel metrik
- ✅ **Monitoring AI** — R² drift detection, MAE/RMSE harian, health table
- ✅ **Dataset Management** — Tabel data, upload CSV drag & drop, CRUD
- ✅ **User Management** — Daftar user, toggle aktif/nonaktif, role
- ✅ **Retrain Model** — Live training log dengan step-by-step progress
- ✅ **Riwayat Prediksi** — Filter, search, export — semua prediksi tercatat
- ✅ **Insight Properti** — Rekomendasi AI, peta harga kecamatan, analisis investasi

---

## 🔗 Integrasi Backend (Next Step)

Ganti mock data di `src/data/mockData.js` dengan fetch ke API FastAPI:

```js
// Contoh: Prediksi harga
const response = await fetch("http://localhost:8000/predict", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ lokasi, lt, lb, kt, km, garasi }),
});
const { harga, confidence } = await response.json();
```

---

## 👨‍💻 Dibuat untuk KP / Skripsi
> Machine Learning + Data Analytics + Web Dashboard — AI Real Estate Platform