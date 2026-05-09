import { TrendingUp, TrendingDown, Minus, MapPin, Cpu, BarChart2, Home } from "lucide-react";
import { SectionHeader } from "../components/ui";
import { insightBandung, hargaPerLokasi, formatRupiah } from "../data/mockData";

const KATEGORI_ICON = {
  harga:    Home,
  investasi: TrendingUp,
  ai:       Cpu,
  pasar:    BarChart2,
};

const KATEGORI_COLOR = {
  harga:    "badge-rose",
  investasi: "badge-green",
  ai:       "badge-purple",
  pasar:    "badge-orange",
};

export default function Insight() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Insight cards */}
      <div>
        <SectionHeader title="Insight Terkini" sub="Analisis AI berdasarkan data properti Bandung" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {insightBandung.map((ins, i) => {
            const Icon = KATEGORI_ICON[ins.kategori] ?? Home;
            return (
              <div
                key={ins.id}
                className="card p-5 space-y-3 hover:border-surface-700 transition-all duration-300 animate-slide-up opacity-0"
                style={{ animationDelay: `${i * 100}ms`, animationFillMode: "forwards" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                      <Icon size={15} className="text-brand-400" />
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-surface-100 text-sm">{ins.judul}</h3>
                      <p className="text-xs text-surface-500 mt-0.5">{ins.tanggal}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={KATEGORI_COLOR[ins.kategori]}>{ins.kategori}</span>
                    <div className={`flex items-center gap-1 text-xs font-mono font-semibold ${
                      ins.trend === "naik" ? "text-brand-400" : ins.trend === "turun" ? "text-accent-rose" : "text-surface-400"
                    }`}>
                      {ins.trend === "naik" ? <TrendingUp size={12} /> : ins.trend === "turun" ? <TrendingDown size={12} /> : <Minus size={12} />}
                      {ins.nilai}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-surface-400 leading-relaxed">{ins.deskripsi}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Heatmap text */}
      <div className="card p-5">
        <SectionHeader title="Peta Harga Bandung" sub="Visualisasi harga rata-rata per kecamatan (dalam Miliar Rp)" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {hargaPerLokasi.map(({ lokasi, rata }) => {
            const maxVal = 3.5;
            const pct    = rata / maxVal;
            const r      = Math.round(pct * 220);
            const g      = Math.round((1 - pct) * 180);
            const color  = `rgb(${r},${g},80)`;
            return (
              <div
                key={lokasi}
                className="rounded-xl p-4 text-center border border-surface-700/50 hover:scale-105 transition-transform duration-200 cursor-pointer"
                style={{ background: `linear-gradient(135deg, ${color}18, ${color}08)`, borderColor: `${color}30` }}
              >
                <MapPin size={14} className="mx-auto mb-1.5" style={{ color }} />
                <p className="text-xs font-medium text-surface-200 mb-1">{lokasi}</p>
                <p className="font-display font-bold text-base" style={{ color }}>{rata} M</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Smart recommendations */}
      <div className="card p-5">
        <SectionHeader title="Rekomendasi Investasi AI" sub="Berdasarkan analisis tren dan model prediksi" />
        <div className="space-y-3">
          {[
            {
              lokasi: "Gedebage",
              rekomendasi: "BUY",
              alasan: "Pertumbuhan harga tertinggi 15% YoY, didukung infrastruktur LRT dan pengembangan kawasan timur Bandung.",
              potensi: "+18–22% dalam 2 tahun",
              color: "text-brand-400",
              bg: "bg-brand-500/5 border-brand-500/20",
            },
            {
              lokasi: "Rancasari",
              rekomendasi: "HOLD",
              alasan: "Harga stabil dengan pertumbuhan moderat. Cocok sebagai properti hunian jangka panjang.",
              potensi: "+8–12% dalam 2 tahun",
              color: "text-accent-amber",
              bg: "bg-accent-amber/5 border-accent-amber/20",
            },
            {
              lokasi: "Dago",
              rekomendasi: "PREMIUM",
              alasan: "Kawasan bergengsi dengan permintaan tinggi. Harga sudah premium tapi demand konsisten.",
              potensi: "+5–8% dalam 2 tahun",
              color: "text-accent-purple",
              bg: "bg-accent-purple/5 border-accent-purple/20",
            },
          ].map(({ lokasi, rekomendasi, alasan, potensi, color, bg }) => (
            <div key={lokasi} className={`flex items-start gap-4 p-4 rounded-xl border ${bg}`}>
              <div className={`flex-shrink-0 font-display font-bold text-xs px-2.5 py-1 rounded-lg border ${color} bg-current/10`}
                style={{ borderColor: "currentColor", background: "rgba(0,0,0,0.2)" }}>
                {rekomendasi}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin size={12} className={color} />
                  <span className="font-display font-semibold text-surface-100 text-sm">{lokasi}</span>
                </div>
                <p className="text-xs text-surface-400">{alasan}</p>
                <p className={`text-xs font-mono font-semibold mt-1.5 ${color}`}>{potensi}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}