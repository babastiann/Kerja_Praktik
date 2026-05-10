import { TrendingUp, TrendingDown, Minus, MapPin, Cpu, BarChart2, Home, Loader2 } from "lucide-react";
import { SectionHeader } from "../components/ui";
import { useApi } from "../hooks/useApi";
import { apiInsights, apiAnalisis } from "../utils/api";

const KATEGORI_ICON = { harga: Home, investasi: TrendingUp, ai: Cpu, pasar: BarChart2 };
const KATEGORI_COLOR = { harga: "badge-rose", investasi: "badge-green", ai: "badge-purple", pasar: "badge-orange" };

export default function Insight() {
  const { data: insights, loading: insLoading } = useApi(apiInsights);
  const { data: analisis } = useApi(apiAnalisis);

  const lokasiData = analisis?.harga_per_lokasi || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Insight cards */}
      <div>
        <SectionHeader title="Insight Terkini" sub="Data langsung dari database properti Bandung" />
        {insLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 size={24} className="animate-spin text-brand-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(insights || []).map((ins, i) => {
              const Icon = KATEGORI_ICON[ins.kategori] ?? Home;
              return (
                <div key={ins.id} className="card p-5 space-y-3 hover:border-surface-700 transition-all duration-300 animate-slide-up opacity-0" style={{ animationDelay: `${i * 100}ms`, animationFillMode: "forwards" }}>
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
                      <div className={`flex items-center gap-1 text-xs font-mono font-semibold ${ins.trend === "naik" ? "text-brand-400" : ins.trend === "turun" ? "text-accent-rose" : "text-surface-400"}`}>
                        {ins.trend === "naik" ? <TrendingUp size={12} /> : ins.trend === "turun" ? <TrendingDown size={12} /> : <Minus size={12} />}
                        {ins.nilai}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-surface-400 leading-relaxed">{ins.deskripsi}</p>
                </div>
              );
            })}
            {(insights || []).length === 0 && (
              <div className="card p-8 text-center col-span-2 text-surface-500">
                <p>Belum ada insight yang dipublikasikan.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Heatmap lokasi */}
      {lokasiData.length > 0 && (
        <div className="card p-5">
          <SectionHeader title="Peta Harga Bandung" sub="Visualisasi harga rata-rata per kecamatan (data live)" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {lokasiData.map(({ lokasi, rata }) => {
              const maxVal = 3.5;
              const pct = rata / maxVal;
              const r = Math.round(pct * 220);
              const g = Math.round((1 - pct) * 180);
              const color = `rgb(${r},${g},80)`;
              return (
                <div
                  key={lokasi}
                  className="rounded-xl p-4 text-center border border-surface-700/50 hover:scale-105 transition-transform duration-200 cursor-pointer"
                  style={{ background: `linear-gradient(135deg, ${color}18, ${color}08)`, borderColor: `${color}30` }}
                >
                  <MapPin size={14} className="mx-auto mb-1.5" style={{ color }} />
                  <p className="text-xs font-medium text-surface-200 mb-1">{lokasi}</p>
                  <p className="font-display font-bold text-base" style={{ color }}>
                    {rata} M
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
