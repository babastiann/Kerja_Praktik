import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, BarChart, Bar,
} from "recharts";
import { Award, Loader2 } from "lucide-react";
import { SectionHeader } from "../components/ui";
import { useApi } from "../hooks/useApi";
import { apiModels, apiModelR2Hist, apiSetActive } from "../utils/api";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-glass px-3 py-2 text-xs">
      <p className="font-display font-semibold text-surface-300 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-mono">{p.dataKey}: {p.value}</p>
      ))}
    </div>
  );
};

const MODEL_COLORS = { MLR: "#14b8a6", DTR: "#a855f7", RFR: "#f97316", Ensemble: "#f43f5e" };

export default function Model() {
  const { data: models, loading, refetch } = useApi(apiModels);
  const { data: r2Hist } = useApi(apiModelR2Hist);

  const handleSetActive = async (model_name) => {
    try {
      await apiSetActive(model_name);
      refetch();
    } catch (e) { alert(e.message); }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px]">
      <Loader2 size={28} className="animate-spin text-brand-400" />
    </div>
  );

  const list = models || [];
  const best = list.reduce((a, b) => (b.r2_score > (a?.r2_score || 0) ? b : a), null);

  // Buat data radar dari list model
  const radarMetrics = ["R²", "1-MAE", "1-RMSE", "CV"];
  const radarData = radarMetrics.map(m => {
    const row = { metric: m };
    list.forEach(model => {
      if (m === "R²") row[model.model_name] = parseFloat(model.r2_score) || 0;
      else if (m === "1-MAE") row[model.model_name] = +(1 - (model.mae || 0) / 300).toFixed(2);
      else if (m === "1-RMSE") row[model.model_name] = +(1 - (model.rmse || 0) / 400).toFixed(2);
      else if (m === "CV") row[model.model_name] = parseFloat(model.cv_score) || 0;
    });
    return row;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {list.map((m, i) => (
          <div
            key={m.id || m.model_name}
            className={`card p-4 space-y-3 animate-slide-up opacity-0 ${m.is_active ? "border-brand-500/40 ring-1 ring-brand-500/20" : ""}`}
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: "forwards" }}
          >
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-surface-100 text-base">{m.model_name}</span>
              {m.is_active && <span className="badge-orange"><Award size={10} />Aktif</span>}
            </div>
            <div className="space-y-2">
              {[
                { label: "R²",   val: m.r2_score,       color: "#14b8a6" },
                { label: "MAE",  val: `${m.mae} Jt`,    color: "#f97316" },
                { label: "RMSE", val: `${m.rmse} Jt`,   color: "#a855f7" },
                { label: "MAPE", val: `${m.mape || "—"}%`, color: "#f59e0b" },
              ].map(({ label, val, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-surface-500">{label}</span>
                  <span className="text-xs font-mono font-semibold" style={{ color }}>{val}</span>
                </div>
              ))}
            </div>
            <div>
              <div className="flex justify-between text-[10px] text-surface-600 mb-1">
                <span>R² Score</span><span>{m.r2_score}</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-800 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(m.r2_score || 0) * 100}%`, background: MODEL_COLORS[m.model_name] || "#14b8a6" }} />
              </div>
            </div>
            {!m.is_active && (
              <button className="btn-ghost text-xs w-full py-1.5" onClick={() => handleSetActive(m.model_name)}>
                Set Aktif
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* R² over time */}
        <div className="card p-5">
          <SectionHeader title="R² Score Sepanjang Waktu" sub="Perbandingan performa model bulanan" />
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={r2Hist || []} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
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
          <SectionHeader title="Radar Perbandingan" sub="Skala ternormalisasi 0–1" />
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <PolarGrid stroke="#1e293b" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#64748b", fontSize: 10 }} />
              {list.map(m => (
                <Radar key={m.model_name} name={m.model_name} dataKey={m.model_name}
                  stroke={MODEL_COLORS[m.model_name] || "#14b8a6"}
                  fill={MODEL_COLORS[m.model_name] || "#14b8a6"} fillOpacity={0.08} strokeWidth={1.5} />
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
          <BarChart data={list} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="model_name" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
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