import { useState } from "react";
import { Home, ChevronDown, Loader2, CheckCircle, Info, Sparkles } from "lucide-react";
import { ProgressRing } from "../components/ui";
import { lokasiOptions, formatRupiah } from "../data/mockData";

const fasilitasOptions = ["Kolam Renang", "Taman", "CCTV", "Water Heater", "AC", "Carport", "Listrik 2200W+", "PDAM"];

function hitungPrediksi({ lokasi, lt, lb, kt, km, garasi, fasilitas }) {
  const baseHarga = {
    "Dago": 3.0, "Setiabudi": 2.8, "Coblong": 2.2, "Cidadap": 2.5,
    "Sukajadi": 1.7, "Buah Batu": 1.5, "Antapani": 1.3,
  };
  const base   = (baseHarga[lokasi] ?? 1.0) * 1_000_000_000;
  const harga  = base + lt * 3_500_000 + lb * 4_000_000 + kt * 80_000_000 + km * 50_000_000 + garasi * 100_000_000 + fasilitas.length * 30_000_000;
  const conf   = Math.min(95, 70 + fasilitas.length * 1.5 + (lt > 100 ? 5 : 0));
  const margin = harga * 0.08;
  return { harga: Math.round(harga), min: Math.round(harga - margin), max: Math.round(harga + margin), conf: Math.round(conf) };
}

export default function Prediksi() {
  const [form, setForm] = useState({
    lokasi: "", lt: "", lb: "", kt: "3", km: "2", garasi: "1", fasilitas: [],
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const toggleFasilitas = (f) => {
    setForm(prev => ({
      ...prev,
      fasilitas: prev.fasilitas.includes(f) ? prev.fasilitas.filter(x => x !== f) : [...prev.fasilitas, f],
    }));
  };

  const handleSubmit = () => {
    if (!form.lokasi || !form.lt || !form.lb) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult(hitungPrediksi({ ...form, lt: +form.lt, lb: +form.lb, kt: +form.kt, km: +form.km, garasi: +form.garasi }));
      setLoading(false);
    }, 1800);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-3 card p-6 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-surface-800">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
              <Home size={18} className="text-brand-400" />
            </div>
            <div>
              <h2 className="section-title">Input Data Rumah</h2>
              <p className="text-xs text-surface-500">Isi detail properti untuk mendapatkan estimasi harga</p>
            </div>
          </div>

          {/* Lokasi */}
          <div>
            <label className="label">Lokasi / Kecamatan</label>
            <div className="relative">
              <select className="select-field pr-10" value={form.lokasi} onChange={e => set("lokasi", e.target.value)}>
                <option value="">Pilih kecamatan...</option>
                {lokasiOptions.map(l => <option key={l}>{l}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none" />
            </div>
          </div>

          {/* Luas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Luas Tanah (m²)</label>
              <input type="number" className="input-field" placeholder="cth: 150" value={form.lt} onChange={e => set("lt", e.target.value)} />
            </div>
            <div>
              <label className="label">Luas Bangunan (m²)</label>
              <input type="number" className="input-field" placeholder="cth: 100" value={form.lb} onChange={e => set("lb", e.target.value)} />
            </div>
          </div>

          {/* Kamar */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { key: "kt", label: "Kamar Tidur", max: 8 },
              { key: "km", label: "Kamar Mandi", max: 6 },
              { key: "garasi", label: "Garasi", max: 4 },
            ].map(({ key, label, max }) => (
              <div key={key}>
                <label className="label">{label}</label>
                <div className="relative">
                  <select className="select-field pr-8" value={form[key]} onChange={e => set(key, e.target.value)}>
                    {Array.from({ length: max }, (_, i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none" />
                </div>
              </div>
            ))}
          </div>

          {/* Fasilitas */}
          <div>
            <label className="label">Fasilitas Tambahan</label>
            <div className="flex flex-wrap gap-2">
              {fasilitasOptions.map(f => (
                <button
                  key={f}
                  onClick={() => toggleFasilitas(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs border transition-all duration-200 font-body ${
                    form.fasilitas.includes(f)
                      ? "bg-brand-500/15 border-brand-500/40 text-brand-300"
                      : "bg-surface-900 border-surface-700 text-surface-400 hover:border-surface-600"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || !form.lokasi || !form.lt || !form.lb}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed py-3"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" />Memproses...</>
            ) : (
              <><Sparkles size={16} />Prediksi Harga</>
            )}
          </button>
        </div>

        {/* Result */}
        <div className="lg:col-span-2 space-y-4">
          {result ? (
            <div className="card p-6 space-y-5 animate-slide-up">
              <div className="flex items-center gap-2">
                <CheckCircle size={18} className="text-brand-400" />
                <h3 className="section-title">Hasil Prediksi</h3>
              </div>

              {/* Main price */}
              <div className="text-center py-5 border-y border-surface-800">
                <p className="text-xs font-display uppercase tracking-widest text-surface-500 mb-2">Estimasi Harga</p>
                <p className="font-display font-bold text-3xl text-brand-400 tracking-tight">
                  {formatRupiah(result.harga)}
                </p>
                <p className="text-xs text-surface-500 font-mono mt-2">
                  {formatRupiah(result.min)} — {formatRupiah(result.max)}
                </p>
              </div>

              {/* Confidence */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-surface-500 font-display uppercase tracking-wider">Confidence Score</p>
                  <p className="text-sm text-surface-300 mt-0.5 font-mono">Model: Random Forest</p>
                </div>
                <ProgressRing value={result.conf} size={72} stroke={6} color="#14b8a6" />
              </div>

              {/* Smart remark */}
              <div className="bg-brand-500/5 border border-brand-500/20 rounded-xl p-3.5 flex gap-2.5">
                <Info size={14} className="text-brand-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-surface-400 leading-relaxed">
                  Rumah di <span className="text-brand-300 font-medium">{form.lokasi}</span> dengan spesifikasi ini
                  tergolong <span className="text-surface-200 font-medium">
                    {result.harga > 2_000_000_000 ? "premium" : result.harga > 1_200_000_000 ? "menengah atas" : "menengah"}
                  </span> untuk kawasan tersebut.
                </p>
              </div>
            </div>
          ) : (
            <div className="card p-6 flex flex-col items-center justify-center gap-4 h-full min-h-[300px] border-dashed">
              <div className="w-16 h-16 rounded-2xl bg-surface-800 flex items-center justify-center">
                <Home size={28} className="text-surface-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-display font-semibold text-surface-500">Hasil prediksi akan muncul di sini</p>
                <p className="text-xs text-surface-600 mt-1">Isi form dan klik tombol prediksi</p>
              </div>
            </div>
          )}

          {/* Info model */}
          <div className="card p-4 space-y-2">
            <p className="text-xs font-display font-semibold text-surface-400 uppercase tracking-wider">Model Aktif</p>
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-surface-200">Random Forest</span>
              <span className="badge-green">R² 0.871</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-surface-500">MAE</span>
              <span className="text-xs font-mono text-surface-300">Rp 98 Jt</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-surface-500">RMSE</span>
              <span className="text-xs font-mono text-surface-300">Rp 132 Jt</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}