import { Menu, Bell, Search } from "lucide-react";
import { useLocation } from "react-router-dom";

const routeTitles = {
  "/":           "Dashboard Utama",
  "/prediksi":   "Prediksi Harga Rumah",
  "/analisis":   "Analisis Data",
  "/model":      "Perbandingan Model AI",
  "/monitoring": "Monitoring AI",
  "/dataset":    "Dataset Management",
  "/users":      "User Management",
  "/retrain":    "Retrain Model",
  "/riwayat":    "Riwayat Prediksi",
  "/insight":    "Insight Properti Bandung",
};

export default function Topbar({ onMenuClick }) {
  const { pathname } = useLocation();
  const title = routeTitles[pathname] ?? "RumahAI";

  return (
    <header className="sticky top-0 z-20 bg-surface-950/80 backdrop-blur-xl border-b border-surface-800 px-4 lg:px-6 py-3.5 flex items-center gap-4">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-surface-400 hover:text-surface-100 transition-colors"
      >
        <Menu size={22} />
      </button>

      <div className="flex-1">
        <h1 className="font-display font-bold text-surface-100 text-base tracking-tight">{title}</h1>
        <p className="text-[11px] text-surface-500 font-mono hidden sm:block">
          {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Search */}
      <div className="hidden sm:flex items-center gap-2 bg-surface-900 border border-surface-800 rounded-xl px-3 py-2 w-52 focus-within:border-brand-500 transition-colors">
        <Search size={13} className="text-surface-500" />
        <input
          className="bg-transparent text-xs text-surface-300 placeholder-surface-600 focus:outline-none flex-1"
          placeholder="Cari..."
        />
      </div>

      {/* Bell */}
      <button className="relative text-surface-400 hover:text-surface-100 transition-colors">
        <Bell size={18} />
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-brand-500 rounded-full shadow-glow-teal" />
      </button>
    </header>
  );
}