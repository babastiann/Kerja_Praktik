import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, BarChart, Bar,
} from "recharts";
import { Award, TrendingUp } from "lucide-react";
import { SectionHeader } from "../components/ui";
import { modelMetrics, modelR2Chart } from "../data/mockData";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-glass px-3 py-2 text-xs">
      <p className="font-display font-semibold text-surface-300 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-mono">
          {p.dataKey}: {p.value}
        </p>
      ))}
    </div>
  );
};

// Normalize to 0-1 scale for radar
const radarData = [
  { metric: "R²",    MLR: 0.721, DTR: 0.798, RFR: 0.871, Ensemble: 0.892 },
  { metric: "1-MAE", MLR: 0.74,  DTR: 0.80,  RFR: 0.89,  Ensemble: 0.91 },
  { metric: "1-RMSE",MLR: 0.71,  DTR: 0.77,  RFR: 0.87,  Ensemble: 0.89 },
  { metric: "CV",    MLR: 0.698, DTR: 0.771, RFR: 0.858, Ensemble: 0.879 },
  { metric: "MAPE",  MLR: 0.65,  DTR: 0.73,  RFR: 0.83,  Ensemble: 0.85 },
];

const MODEL_COLORS = { MLR: "#14b8a6", DTR: "#a855f7", RFR: "#f97316", Ensemble: "#f43f5e" };

export default function Model() {
  const best = modelMetrics.reduce((a, b) => b.r2 > a.r2 ? b : a);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {modelMetrics.map((m, i) => (
          <div
            key={m.model}
            className={`card p-4 space-y-3 animate-slide-up opacity-0 ${m.model === best.model ? "border-brand-500/40 ring-1 ring-brand-500/20" : ""}`}
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: "forwards" }}
          >
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-surface-100 text-base">{m.model}</span>
              {m.model === best.model && (
                <span className="badge-orange"><Award size={10} />Best</span>
              )}
            </div>
            <div className="space-y-2">
              {[
                { label: "R²",   val: m.r2,   color: "#14b8a6" },
                { label: "MAE",  val: `${m.mae} Jt`, color: "#f97316" },
                { label: "RMSE", val: `${m.rmse} Jt`, color: "#a855f7" },
                { label: "MAPE", val: `${m.mape}%`,  color: "#f59e0b" },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-surface-500">{label}</span>
                  <span className="text-xs font-mono font-semibold" style={{ color }}>{val}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-surface-600 mb-1">
                <span>R² Score</span><span>{m.r2}</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-800 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${m.r2 * 100}%`, background: m.warna }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* R² over time */}
        <div className="card p-5">
          <SectionHeader title="R² Score Sepanjang Waktu" sub="Perbandingan performa model bulanan" />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={modelR2Chart} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="bulan" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0.65, 0.95]} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
              {Object.entries(MODEL_COLORS).map(([key, color]) => (
                <Line key={key} type="monotone" dataKey={key} stroke={color} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Radar */}
        <div className="card p-5">
          <SectionHeader title="Radar Perbandingan" sub="Skala ternormalisasi 0–1 (lebih tinggi = lebih baik)" />
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#64748b", fontSize: 10 }} />
              {Object.entries(MODEL_COLORS).map(([key, color]) => (
                <Radar key={key} name={key} dataKey={key} stroke={color} fill={color} fillOpacity={0.08} strokeWidth={1.5} />
              ))}
              <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* MAE/RMSE bar */}
      <div className="card p-5">
        <SectionHeader title="MAE & RMSE per Model" sub="Dalam juta Rupiah — semakin rendah semakin baik" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={modelMetrics} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="model" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
            <Bar dataKey="mae"  name="MAE"  fill="#14b8a6" radius={[4,4,0,0]} barSize={28} />
            <Bar dataKey="rmse" name="RMSE" fill="#f97316" radius={[4,4,0,0]} barSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}