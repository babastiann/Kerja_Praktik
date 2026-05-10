import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Database, Zap, Award, TrendingUp, MapPin, ArrowUpRight, Loader2 } from "lucide-react";
import { StatCard, SectionHeader } from "../components/ui";
import { featureImportance, formatRupiah } from "../data/mockData";
import { useApi } from "../hooks/useApi";
import { apiDashboardStats } from "../utils/api";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-glass px-3 py-2.5 text-xs space-y-1">
      <p className="font-display font-semibold text-surface-300">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-mono">
          {p.name}: {p.value} M
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { data, loading, error } = useApi(apiDashboardStats);

  if (loading)
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 flex items-center justify-center min-h-[100px]">
              <Loader2 size={20} className="animate-spin text-brand-400" />
            </div>
          ))}
        </div>
      </div>
    );

  if (error)
    return (
      <div className="card p-6 text-center text-accent-rose">
        <p className="font-display font-semibold">Gagal memuat data</p>
        <p className="text-xs text-surface-500 mt-1">{error}</p>
      </div>
    );

  const { stats, model_aktif, harga_per_lokasi = [], tren_bulanan = [] } = data || {};

  const lokasiSorted = [...harga_per_lokasi].sort((a, b) => b.rata - a.rata);
  const termahal = lokasiSorted[0];
  const termurah = lokasiSorted[lokasiSorted.length - 1];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Dataset" value={Number(stats?.total_dataset || 0).toLocaleString("id-ID")} sub="rumah terdaftar" icon={Database} color="teal" delay={0} />
        <StatCard label="Total Prediksi" value={Number(stats?.total_prediksi || 0).toLocaleString("id-ID")} sub="sejak awal" icon={Zap} color="orange" delay={100} />
        <StatCard label="Model Terbaik" value={model_aktif ? `R² ${model_aktif.r2_score}` : "—"} sub={model_aktif?.model_name || "—"} icon={Award} color="purple" delay={200} />
        <StatCard label="Rata-rata Harga" value={stats?.rata_rata_harga ? formatRupiah(Number(stats.rata_rata_harga)) : "—"} sub="se-Kota Bandung" icon={TrendingUp} color="amber" delay={300} />
      </div>

      {/* Chart + Feature Importance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 card p-5">
          <SectionHeader title="Tren Prediksi Bulanan" sub="Rata-rata harga prediksi per bulan (dalam Miliar)" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={tren_bulanan} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradPred" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="bulan" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
              <Area type="monotone" dataKey="prediksi" name="Prediksi" stroke="#14b8a6" fill="url(#gradPred)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <SectionHeader title="Feature Importance" sub="Random Forest" />
          <div className="space-y-3 mt-1">
            {featureImportance.map((f) => (
              <div key={f.feature}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-surface-400">{f.feature}</span>
                  <span className="text-xs font-mono text-surface-200">{f.value}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-surface-800 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${f.value}%`, background: f.color, transition: "width 1s ease" }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Harga per lokasi */}
      <div className="card p-5">
        <SectionHeader title="Harga Rata-rata per Lokasi" sub="Top 10 kecamatan — dalam Miliar Rupiah">
          <span className="badge-green">Live</span>
        </SectionHeader>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={harga_per_lokasi} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="lokasi" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="rata" name="Rata-rata" fill="#14b8a6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Quick info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { lokasi: termahal?.lokasi || "—", label: "Termahal", harga: termahal ? `${termahal.rata} M` : "—", color: "text-accent-rose", bg: "bg-accent-rose/5 border-accent-rose/20" },
          { lokasi: "Buah Batu", label: "Terpopuler", harga: "—", color: "text-brand-400", bg: "bg-brand-500/5 border-brand-500/20" },
          { lokasi: termurah?.lokasi || "—", label: "Termurah", harga: termurah ? `${termurah.rata} M` : "—", color: "text-accent-amber", bg: "bg-accent-amber/5 border-accent-amber/20" },
        ].map((d) => (
          <div key={d.lokasi} className={`rounded-2xl border p-4 flex items-center gap-4 ${d.bg}`}>
            <div className="w-10 h-10 rounded-xl bg-surface-900 flex items-center justify-center flex-shrink-0">
              <MapPin size={18} className={d.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-surface-500 font-display uppercase tracking-wider">{d.label}</p>
              <p className="font-display font-bold text-surface-100">{d.lokasi}</p>
              <p className={`text-sm font-mono font-semibold ${d.color}`}>{d.harga}</p>
            </div>
            <ArrowUpRight size={14} className="text-surface-600 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
