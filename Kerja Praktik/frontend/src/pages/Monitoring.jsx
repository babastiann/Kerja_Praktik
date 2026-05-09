import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
} from "recharts";
import { Activity, AlertTriangle, CheckCircle, Cpu, Clock } from "lucide-react";
import { StatCard, SectionHeader } from "../components/ui";
import { monitoringData, modelMetrics } from "../data/mockData";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-glass px-3 py-2 text-xs">
      <p className="font-display font-semibold text-surface-300 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color }} className="font-mono">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export default function Monitoring() {
  const latest = monitoringData[monitoringData.length - 1];
  const prev   = monitoringData[monitoringData.length - 2];
  const drift  = (latest.r2 - prev.r2).toFixed(3);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="R² Hari Ini"    value={latest.r2}            sub="vs kemarin"       icon={Activity}       color="teal"   trend={+(drift * 100).toFixed(1)} />
        <StatCard label="MAE Hari Ini"   value={`${latest.mae} Jt`}   sub="rata-rata absolut" icon={Cpu}            color="orange" />
        <StatCard label="Request Hari ini" value={latest.req}          sub="prediksi diproses" icon={Clock}          color="purple" />
        <StatCard label="Status Model"   value="Normal"               sub="tidak ada drift"  icon={CheckCircle}    color="teal"   />
      </div>

      {/* R² monitoring */}
      <div className="card p-5">
        <SectionHeader title="R² Score — 14 Hari Terakhir" sub="Deteksi model drift secara real-time">
          <div className={`badge ${+drift >= 0 ? "badge-green" : "badge-rose"}`}>
            {+drift >= 0 ? "↑" : "↓"} {Math.abs(drift)} drift
          </div>
        </SectionHeader>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={monitoringData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="gradR2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#14b8a6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}   />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="hari" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis domain={[0.82, 0.92]} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="r2" name="R²" stroke="#14b8a6" fill="url(#gradR2)" strokeWidth={2} dot={{ fill: "#14b8a6", r: 3 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* MAE & RMSE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <SectionHeader title="MAE Harian" sub="Mean Absolute Error dalam juta Rp" />
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={monitoringData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="hari" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="mae" name="MAE" stroke="#f97316" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-5">
          <SectionHeader title="Jumlah Request Harian" sub="Prediksi yang diproses per hari" />
          <ResponsiveContainer width="100%" height={170}>
            <AreaChart data={monitoringData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="gradReq" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="hari" tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 9 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="req" name="Request" stroke="#a855f7" fill="url(#gradReq)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model health table */}
      <div className="card p-5">
        <SectionHeader title="Kesehatan Semua Model" />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-800">
                <th className="table-th">Model</th>
                <th className="table-th">R²</th>
                <th className="table-th">MAE</th>
                <th className="table-th">RMSE</th>
                <th className="table-th">CV Score</th>
                <th className="table-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {modelMetrics.map(m => (
                <tr key={m.model} className="table-row">
                  <td className="table-td font-display font-semibold text-surface-100">{m.model}</td>
                  <td className="table-td font-mono" style={{ color: m.warna }}>{m.r2}</td>
                  <td className="table-td font-mono text-surface-300">{m.mae} Jt</td>
                  <td className="table-td font-mono text-surface-300">{m.rmse} Jt</td>
                  <td className="table-td font-mono text-surface-300">{m.cv}</td>
                  <td className="table-td">
                    <span className={m.r2 >= 0.85 ? "badge-green" : m.r2 >= 0.75 ? "badge-orange" : "badge-rose"}>
                      {m.r2 >= 0.85 ? "Excellent" : m.r2 >= 0.75 ? "Good" : "Fair"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drift alert */}
      <div className="flex items-start gap-3 bg-accent-amber/5 border border-accent-amber/20 rounded-2xl p-4">
        <AlertTriangle size={18} className="text-accent-amber flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-display font-semibold text-accent-amber">Threshold Drift</p>
          <p className="text-xs text-surface-400 mt-0.5">
            Sistem akan mengirim notifikasi otomatis jika R² turun lebih dari <span className="font-mono text-surface-200">0.05</span> dalam satu sesi monitoring. Saat ini model dalam kondisi stabil.
          </p>
        </div>
      </div>
    </div>
  );
}