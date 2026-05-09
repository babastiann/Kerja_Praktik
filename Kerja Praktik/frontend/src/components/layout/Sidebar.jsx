import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Home, BarChart2, GitCompare, Activity,
  Database, Users, RefreshCw, History, MapPin, X, Cpu,
} from "lucide-react";

const navItems = [
  { to: "/",          label: "Dashboard",         icon: LayoutDashboard },
  { to: "/prediksi",  label: "Prediksi Harga",    icon: Home },
  { to: "/analisis",  label: "Analisis Data",      icon: BarChart2 },
  { to: "/model",     label: "Perbandingan Model", icon: GitCompare },
  { to: "/monitoring",label: "Monitoring AI",      icon: Activity },
  { to: "/dataset",   label: "Dataset",            icon: Database },
  { to: "/users",     label: "User Management",    icon: Users },
  { to: "/retrain",   label: "Retrain Model",      icon: RefreshCw },
  { to: "/riwayat",   label: "Riwayat Prediksi",  icon: History },
  { to: "/insight",   label: "Insight Properti",   icon: MapPin },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-40 w-64 flex flex-col
          bg-surface-950 border-r border-surface-800
          transition-transform duration-300 ease-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-surface-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow-teal">
              <Cpu size={16} className="text-surface-950" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-display font-bold text-surface-50 text-base tracking-tight">
                Rumah<span className="text-brand-400">AI</span>
              </span>
              <p className="text-[10px] text-surface-500 font-mono">Properti Bandung</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-surface-500 hover:text-surface-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
          <p className="px-3 pt-1 pb-2 text-[10px] font-display font-semibold text-surface-600 uppercase tracking-widest">
            Menu Utama
          </p>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                isActive ? "nav-item-active" : "nav-item"
              }
            >
              <Icon size={16} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-surface-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-900">
            <div className="w-8 h-8 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center">
              <span className="text-brand-400 text-xs font-display font-bold">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-200 truncate">Admin</p>
              <p className="text-xs text-surface-500 truncate">admin@rumahai.id</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-brand-500 shadow-glow-teal flex-shrink-0" />
          </div>
        </div>
      </aside>
    </>
  );
}