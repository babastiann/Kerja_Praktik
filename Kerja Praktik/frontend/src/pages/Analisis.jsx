import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis } from "recharts";
import { SectionHeader } from "../components/ui";
import { featureImportance } from "../data/mockData";
import { useApi } from "../hooks/useApi";
import { apiAnalisis } from "../utils/api";
import { Loader2 } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-glass px-3 py-2 text-xs">
      <p className="font-display font-semibold text-surface-300 mb-1">{label || payload[0]?.name}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-mono">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

const KORELASI_LABELS = {
  luas_bangunan: "Luas Bangunan",
  luas_tanah: "Luas Tanah",
  kamar_tidur: "Kamar Tidur",
  kamar_mandi: "Kamar Mandi",
  garasi: "Garasi",
};
const KORELASI_COLORS = ["#14b8a6", "#a855f7", "#f97316", "#f59e0b", "#f43f5e", "#22d3ee"];

export default function Analisis() {
  const { data, loading, error } = useApi(apiAnalisis);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 size={28} className="animate-spin text-brand-400" />
      </div>
    );
  if (error)
    return (
      <div className="card p-6 text-center text-accent-rose">
        <p className="font-display font-semibold">Gagal memuat data analisis</p>
        <p className="text-xs text-surface-500 mt-1">{error}</p>
      </div>
    );

  const distribusi = (data?.distribusi_harga || []).map((d) => ({ range: d.range_harga, jumlah: Number(d.jumlah) }));
  const hargaPerLokasi = data?.harga_per_lokasi || [];
  const scatter = data?.scatter_data || [];
  const korelasi = data?.korelasi || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribusi Harga */}
        <div className="card p-5">
          <SectionHeader title="Distribusi Harga Rumah" sub="Jumlah properti per rentang harga" />
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={distribusi} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="range" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="jumlah" name="Jumlah" fill="#14b8a6" radius={[4, 4, 0, 0]}>
                {distribusi.map((_, i) => (
                  <Cell key={i} fill={`hsl(${175 - i * 8}, 70%, ${50 - i * 3}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Feature Importance Pie */}
        <div className="card p-5">
          <SectionHeader title="Kontribusi Fitur" sub="Feature importance dari Random Forest" />
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={220}>
              <PieChart>
                <Pie data={featureImportance} dataKey="value" nameKey="feature" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {featureImportance.map((f, i) => (
                    <Cell key={i} fill={f.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {featureImportance.map((f) => (
                <div key={f.feature} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: f.color }} />
                  <span className="text-xs text-surface-400 flex-1 truncate">{f.feature}</span>
                  <span className="text-xs font-mono text-surface-200">{f.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Harga per Lokasi */}
        <div className="card p-5">
          <SectionHeader title="Harga per Lokasi" sub="Min, rata-rata, max (Miliar Rp)" />
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={hargaPerLokasi} layout="vertical" margin={{ top: 0, right: 10, left: 55, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="lokasi" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="min" name="Min" stackId="a" fill="#134e4a" radius={0} />
              <Bar dataKey="rata" name="Rata" stackId="a" fill="#14b8a6" radius={0} />
              <Bar dataKey="max" name="Max" stackId="a" fill="#5eead4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Scatter */}
        <div className="card p-5">
          <SectionHeader title="Korelasi Luas Tanah vs Harga" sub="Tiap titik = 1 properti (dalam Miliar Rp)" />
          <ResponsiveContainer width="100%" height={230}>
            <ScatterChart margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="lt" name="Luas Tanah" unit=" m²" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="harga" name="Harga" unit=" M" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <ZAxis range={[20, 20]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, fontSize: 11 }} />
              <Scatter data={scatter} fill="#14b8a6" fillOpacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Korelasi summary */}
      <div className="card p-5">
        <SectionHeader title="Ringkasan Korelasi Fitur" sub="Koefisien korelasi Pearson dengan harga (dari database)" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {Object.entries(korelasi).map(([key, val], i) => {
            const color = KORELASI_COLORS[i] || "#14b8a6";
            const r = parseFloat(val) || 0;
            return (
              <div key={key} className="bg-surface-900 rounded-xl p-4 text-center border border-surface-800">
                <div className="text-2xl font-display font-bold mb-1" style={{ color }}>
                  {r.toFixed(2)}
                </div>
                <p className="text-xs text-surface-500">{KORELASI_LABELS[key] || key}</p>
                <div className="mt-2 h-1 rounded-full bg-surface-800 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${Math.abs(r) * 100}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
