// ─── Kecamatan / Kelurahan Bandung ────────────────────────────────────────────
export const lokasiOptions = [
  "Antapani", "Arcamanik", "Astana Anyar", "Babakan Ciparay",
  "Bandung Kidul", "Bandung Kulon", "Bandung Wetan", "Batununggal",
  "Bojongloa Kaler", "Bojongloa Kidul", "Buah Batu", "Cibeunying Kaler",
  "Cibeunying Kidul", "Cibiru", "Cicendo", "Cidadap", "Cinambo",
  "Coblong", "Dago", "Gedebage", "Kiaracondong", "Lengkong",
  "Mandalajati", "Panyileukan", "Rancasari", "Regol", "Selerakan",
  "Setiabudi", "Sukajadi", "Sukasari", "Sumur Bandung", "Ujungberung",
];

// ─── Overview / Stats ─────────────────────────────────────────────────────────
export const overviewStats = {
  totalData:       12450,
  totalPrediksi:   8230,
  modelTerbaik:    "Random Forest",
  r2Terbaik:       0.871,
  rataRataHarga:   1_350_000_000,
  daerahTermahal:  "Dago",
  daerahTermurah:  "Gedebage",
  pertumbuhanData: 12.4,
};

// ─── Price trend (monthly) ────────────────────────────────────────────────────
export const hargaBulanan = [
  { bulan: "Jan", harga: 1.15, prediksi: 1.18 },
  { bulan: "Feb", harga: 1.20, prediksi: 1.21 },
  { bulan: "Mar", harga: 1.18, prediksi: 1.22 },
  { bulan: "Apr", harga: 1.25, prediksi: 1.26 },
  { bulan: "Mei", harga: 1.30, prediksi: 1.28 },
  { bulan: "Jun", harga: 1.28, prediksi: 1.31 },
  { bulan: "Jul", harga: 1.35, prediksi: 1.34 },
  { bulan: "Agu", harga: 1.40, prediksi: 1.38 },
  { bulan: "Sep", harga: 1.38, prediksi: 1.41 },
  { bulan: "Okt", harga: 1.45, prediksi: 1.44 },
  { bulan: "Nov", harga: 1.50, prediksi: 1.48 },
  { bulan: "Des", harga: 1.55, prediksi: 1.52 },
];

// ─── Harga per lokasi ─────────────────────────────────────────────────────────
export const hargaPerLokasi = [
  { lokasi: "Dago",       rata: 3.2, min: 2.1, max: 5.8 },
  { lokasi: "Setiabudi",  rata: 2.9, min: 1.8, max: 4.9 },
  { lokasi: "Coblong",    rata: 2.4, min: 1.5, max: 3.8 },
  { lokasi: "Cidadap",    rata: 2.6, min: 1.7, max: 4.1 },
  { lokasi: "Sukajadi",   rata: 1.8, min: 1.1, max: 2.9 },
  { lokasi: "Buah Batu",  rata: 1.6, min: 1.0, max: 2.5 },
  { lokasi: "Antapani",   rata: 1.4, min: 0.9, max: 2.2 },
  { lokasi: "Kiaracondong", rata: 1.1, min: 0.7, max: 1.8 },
  { lokasi: "Rancasari",  rata: 1.0, min: 0.6, max: 1.6 },
  { lokasi: "Gedebage",   rata: 0.8, min: 0.5, max: 1.3 },
];

// ─── Distribusi harga ─────────────────────────────────────────────────────────
export const distribusiHarga = [
  { range: "< 500 Jt",         jumlah: 420 },
  { range: "500Jt – 1M",       jumlah: 1850 },
  { range: "1M – 1.5M",        jumlah: 3200 },
  { range: "1.5M – 2M",        jumlah: 2700 },
  { range: "2M – 3M",          jumlah: 2100 },
  { range: "3M – 5M",          jumlah: 1400 },
  { range: "> 5M",             jumlah: 780 },
];

// ─── Model comparison ─────────────────────────────────────────────────────────
export const modelMetrics = [
  { model: "MLR",           mae: 185, rmse: 240, r2: 0.721, mape: 14.2, cv: 0.698, warna: "#14b8a6" },
  { model: "DTR",           mae: 145, rmse: 198, r2: 0.798, mape: 11.8, cv: 0.771, warna: "#a855f7" },
  { model: "RFR",           mae: 98,  rmse: 132, r2: 0.871, mape: 7.4,  cv: 0.858, warna: "#f97316" },
  { model: "Ensemble",      mae: 88,  rmse: 118, r2: 0.892, mape: 6.8,  cv: 0.879, warna: "#f43f5e" },
];

export const modelR2Chart = hargaBulanan.map((d, i) => ({
  bulan: d.bulan,
  MLR:      +(0.72 + Math.sin(i*0.5)*0.02).toFixed(3),
  DTR:      +(0.80 + Math.sin(i*0.4)*0.02).toFixed(3),
  RFR:      +(0.87 + Math.sin(i*0.3)*0.015).toFixed(3),
  Ensemble: +(0.89 + Math.sin(i*0.25)*0.01).toFixed(3),
}));

// ─── Feature importance ───────────────────────────────────────────────────────
export const featureImportance = [
  { feature: "Lokasi",         value: 38.5, color: "#14b8a6" },
  { feature: "Luas Bangunan",  value: 22.3, color: "#f97316" },
  { feature: "Luas Tanah",     value: 18.7, color: "#a855f7" },
  { feature: "Kamar Tidur",    value: 9.2,  color: "#f43f5e" },
  { feature: "Kamar Mandi",    value: 6.8,  color: "#f59e0b" },
  { feature: "Garasi",         value: 3.1,  color: "#22d3ee" },
  { feature: "Fasilitas",      value: 1.4,  color: "#a3e635" },
];

// ─── Riwayat prediksi ─────────────────────────────────────────────────────────
export const riwayatPrediksi = Array.from({ length: 30 }, (_, i) => {
  const lokasi = lokasiOptions[Math.floor(Math.random() * lokasiOptions.length)];
  const harga  = Math.round((0.8 + Math.random() * 4) * 1_000_000_000 / 50_000_000) * 50_000_000;
  const conf   = Math.round(72 + Math.random() * 20);
  const date   = new Date(2025, Math.floor(Math.random() * 5), Math.floor(Math.random() * 28) + 1);
  return {
    id:         `PRD-${String(1000 + i).padStart(4, "0")}`,
    tanggal:    date.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
    user:       ["Andi", "Siti", "Budi", "Rina", "Deni"][i % 5],
    lokasi,
    lt:         Math.round(60 + Math.random() * 300),
    lb:         Math.round(40 + Math.random() * 200),
    kt:         Math.floor(2 + Math.random() * 4),
    km:         Math.floor(1 + Math.random() * 3),
    hargaPred:  harga,
    confidence: conf,
    model:      ["RFR", "Ensemble", "DTR"][i % 3],
  };
});

// ─── Dataset ──────────────────────────────────────────────────────────────────
export const datasetSamples = Array.from({ length: 20 }, (_, i) => {
  const lokasi = lokasiOptions[i % lokasiOptions.length];
  const lt     = Math.round(60 + Math.random() * 400);
  const lb     = Math.round(lt * (0.5 + Math.random() * 0.4));
  const kt     = Math.floor(2 + Math.random() * 4);
  const km     = Math.floor(1 + Math.random() * 3);
  const harga  = Math.round((0.7 + Math.random() * 4.5) * 1_000_000_000 / 50_000_000) * 50_000_000;
  return { id: i + 1, lokasi, lt, lb, kt, km, garasi: Math.floor(Math.random() * 3), harga, status: "valid" };
});

// ─── Users ────────────────────────────────────────────────────────────────────
export const daftarUser = [
  { id: 1, nama: "Andi Prasetyo",   email: "andi@example.com",  role: "admin",  status: "aktif",   prediksi: 142, bergabung: "12 Jan 2024" },
  { id: 2, nama: "Siti Rahayu",     email: "siti@example.com",  role: "user",   status: "aktif",   prediksi: 87,  bergabung: "3 Feb 2024" },
  { id: 3, nama: "Budi Santoso",    email: "budi@example.com",  role: "user",   status: "aktif",   prediksi: 204, bergabung: "19 Feb 2024" },
  { id: 4, nama: "Rina Wulandari",  email: "rina@example.com",  role: "user",   status: "nonaktif",prediksi: 31,  bergabung: "5 Mar 2024" },
  { id: 5, nama: "Deni Firmansyah", email: "deni@example.com",  role: "user",   status: "aktif",   prediksi: 118, bergabung: "22 Mar 2024" },
  { id: 6, nama: "Yuni Astuti",     email: "yuni@example.com",  role: "user",   status: "aktif",   prediksi: 56,  bergabung: "8 Apr 2024" },
  { id: 7, nama: "Rizky Maulana",   email: "rizky@example.com", role: "admin",  status: "aktif",   prediksi: 390, bergabung: "15 Jan 2024" },
];

// ─── Monitoring / AI performance ─────────────────────────────────────────────
export const monitoringData = Array.from({ length: 14 }, (_, i) => ({
  hari:  `H-${13 - i}`,
  r2:    +(0.85 + Math.sin(i * 0.4) * 0.02 + Math.random() * 0.01).toFixed(3),
  mae:   +(100 + Math.sin(i * 0.5) * 15 + Math.random() * 5).toFixed(1),
  rmse:  +(135 + Math.sin(i * 0.45) * 18 + Math.random() * 7).toFixed(1),
  req:   Math.floor(40 + Math.random() * 80),
}));

// ─── Retraining history ───────────────────────────────────────────────────────
export const retrainingHistory = [
  { id: 1, tanggal: "12 Mei 2025", model: "RFR",      dataset: "12.450 rows", r2Baru: 0.871, r2Lama: 0.855, durasi: "4m 32s", status: "sukses" },
  { id: 2, tanggal: "28 Apr 2025", model: "Ensemble",  dataset: "11.800 rows", r2Baru: 0.892, r2Lama: 0.879, durasi: "7m 15s", status: "sukses" },
  { id: 3, tanggal: "15 Apr 2025", model: "DTR",       dataset: "11.200 rows", r2Baru: 0.798, r2Lama: 0.781, durasi: "1m 58s", status: "sukses" },
  { id: 4, tanggal: "2 Apr 2025",  model: "MLR",       dataset: "10.900 rows", r2Baru: 0.721, r2Lama: 0.718, durasi: "0m 42s", status: "sukses" },
  { id: 5, tanggal: "20 Mar 2025", model: "RFR",       dataset: "10.500 rows", r2Baru: 0.855, r2Lama: 0.840, durasi: "4m 10s", status: "gagal" },
];

// ─── Insight Properti ─────────────────────────────────────────────────────────
export const insightBandung = [
  {
    id: 1,
    judul: "Dago Tetap Primadona",
    deskripsi: "Kawasan Dago masih menjadi kawasan dengan harga properti tertinggi di Bandung, rata-rata Rp 3,2 M untuk rumah 100 m².",
    kategori: "harga",
    tanggal: "15 Mei 2025",
    trend: "naik",
    nilai: "+8,4%",
  },
  {
    id: 2,
    judul: "Gedebage: Kawasan Potensial",
    deskripsi: "Seiring perkembangan Bandung Timur dan LRT Jabodebek, harga di Gedebage naik signifikan dalam 6 bulan terakhir.",
    kategori: "investasi",
    tanggal: "12 Mei 2025",
    trend: "naik",
    nilai: "+15,2%",
  },
  {
    id: 3,
    judul: "Lokasi Dominasi Feature Importance",
    deskripsi: "Model RFR menunjukkan bahwa lokasi berkontribusi 38,5% terhadap prediksi harga, diikuti luas bangunan 22,3%.",
    kategori: "ai",
    tanggal: "10 Mei 2025",
    trend: "stabil",
    nilai: "38,5%",
  },
  {
    id: 4,
    judul: "Harga Rumah Bandung Naik 12%",
    deskripsi: "Rata-rata harga properti di seluruh Bandung mengalami kenaikan 12% YoY, melampaui inflasi nasional sebesar 3,2%.",
    kategori: "pasar",
    tanggal: "8 Mei 2025",
    trend: "naik",
    nilai: "+12%",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const formatRupiah = (n) => {
  if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(2)} M`;
  if (n >= 1_000_000)     return `Rp ${(n / 1_000_000).toFixed(0)} Jt`;
  return `Rp ${n.toLocaleString("id-ID")}`;
};

export const formatRupiahShort = (n) => {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} M`;
  if (n >= 1_000_000)     return `${(n / 1_000_000).toFixed(0)} Jt`;
  return n.toLocaleString("id-ID");
};