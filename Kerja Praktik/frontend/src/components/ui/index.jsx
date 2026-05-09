import { TrendingUp, TrendingDown, Minus } from "lucide-react";

// ─── StatCard ─────────────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, trend, icon: Icon, color = "teal", delay = 0 }) {
  const colorMap = {
    teal:   "text-brand-400 bg-brand-500/10 border-brand-500/20",
    orange: "text-accent-orange bg-accent-orange/10 border-accent-orange/20",
    purple: "text-accent-purple bg-accent-purple/10 border-accent-purple/20",
    rose:   "text-accent-rose bg-accent-rose/10 border-accent-rose/20",
    amber:  "text-accent-amber bg-accent-amber/10 border-accent-amber/20",
  };
  return (
    <div
      className="stat-card animate-slide-up opacity-0"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colorMap[color]}`}>
          {Icon && <Icon size={18} strokeWidth={1.8} />}
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-mono ${trend > 0 ? "text-brand-400" : trend < 0 ? "text-accent-rose" : "text-surface-400"}`}>
            {trend > 0 ? <TrendingUp size={12} /> : trend < 0 ? <TrendingDown size={12} /> : <Minus size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-display font-semibold text-surface-500 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="font-display font-bold text-2xl text-surface-50 tracking-tight leading-tight">{value}</p>
        {sub && <p className="text-xs text-surface-500 mt-0.5 font-mono">{sub}</p>}
      </div>
    </div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
export function SectionHeader({ title, sub, children }) {
  return (
    <div className="flex items-start justify-between mb-4 gap-4">
      <div>
        <h2 className="section-title">{title}</h2>
        {sub && <p className="text-xs text-surface-500 mt-0.5">{sub}</p>}
      </div>
      {children}
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
export function EmptyState({ message = "Data tidak tersedia" }) {
  return (
    <div className="flex items-center justify-center py-16 text-surface-600">
      <p className="text-sm font-mono">{message}</p>
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-surface-700 border-t-brand-500 rounded-full animate-spin" />
    </div>
  );
}

// ─── MetricBar ────────────────────────────────────────────────────────────────
export function MetricBar({ label, value, max, color = "#14b8a6", unit = "%" }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-body text-surface-400">{label}</span>
        <span className="text-xs font-mono text-surface-200">{value}{unit}</span>
      </div>
      <div className="h-2 rounded-full bg-surface-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
export function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 bg-surface-900 p-1 rounded-xl border border-surface-800 w-fit">
      {tabs.map(t => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-4 py-1.5 rounded-lg text-sm font-display font-medium transition-all duration-200 ${
            active === t
              ? "bg-brand-500 text-surface-950 shadow-glow-teal"
              : "text-surface-400 hover:text-surface-200"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

// ─── ProgressRing ─────────────────────────────────────────────────────────────
export function ProgressRing({ value, size = 80, stroke = 6, color = "#14b8a6" }) {
  const r   = (size - stroke) / 2;
  const c   = 2 * Math.PI * r;
  const off = c - (value / 100) * c;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={off}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}
        style={{ transition: "stroke-dashoffset 1s ease" }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fill="#e2e8f0" fontSize={size * 0.2} fontFamily="JetBrains Mono">
        {value}%
      </text>
    </svg>
  );
}