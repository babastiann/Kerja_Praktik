import { useState } from "react";
import { RefreshCw, CheckCircle, Clock, ChevronDown, Loader2, AlertCircle } from "lucide-react";
import { SectionHeader } from "../components/ui";
import { retrainingHistory } from "../data/mockData";

const STEPS = [
  "Memuat dataset terbaru...",
  "Preprocessing & feature engineering...",
  "Training model dengan cross-validation...",
  "Evaluasi performa model...",
  "Menyimpan model terbaru...",
];

export default function Retrain() {
  const [model, setModel]       = useState("RFR");
  const [running, setRunning]   = useState(false);
  const [step, setStep]         = useState(-1);
  const [done, setDone]         = useState(false);
  const [result, setResult]     = useState(null);

  const handleRetrain = () => {
    setRunning(true);
    setDone(false);
    setStep(0);
    setResult(null);

    STEPS.forEach((_, i) => {
      setTimeout(() => {
        setStep(i);
        if (i === STEPS.length - 1) {
          setTimeout(() => {
            setRunning(false);
            setDone(true);
            setResult({ r2: 0.879, mae: 94, rmse: 128, durasi: "4m 17s" });
          }, 900);
        }
      }, i * 900);
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Config card */}
      <div className="card p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-surface-800">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <RefreshCw size={18} className="text-brand-400" />
          </div>
          <div>
            <h2 className="section-title">Konfigurasi Retrain</h2>
            <p className="text-xs text-surface-500">Training ulang model AI menggunakan dataset terbaru</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Pilih Model</label>
            <div className="relative">
              <select className="select-field pr-10" value={model} onChange={e => setModel(e.target.value)}>
                <option value="RFR">Random Forest Regressor</option>
                <option value="DTR">Decision Tree Regressor</option>
                <option value="MLR">Multiple Linear Regression</option>
                <option value="Ensemble">Ensemble (semua model)</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-500 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="label">Dataset</label>
            <div className="input-field flex items-center justify-between">
              <span className="text-surface-300">dataset_bandung_latest.csv</span>
              <span className="badge-green">12.450 rows</span>
            </div>
          </div>
        </div>

        {/* Training progress */}
        {(running || done) && (
          <div className="bg-surface-950 border border-surface-800 rounded-xl p-4 font-mono text-xs space-y-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse-slow" />
              <span className="text-brand-400 text-[11px]">TRAINING LOG</span>
              <span className="text-surface-600">{new Date().toLocaleTimeString("id-ID")}</span>
            </div>
            {STEPS.map((s, i) => (
              <div key={i} className={`flex items-center gap-2 transition-opacity duration-300 ${i <= step ? "opacity-100" : "opacity-20"}`}>
                {i < step || done ? (
                  <CheckCircle size={12} className="text-brand-400 flex-shrink-0" />
                ) : i === step && running ? (
                  <Loader2 size={12} className="text-brand-400 animate-spin flex-shrink-0" />
                ) : (
                  <Clock size={12} className="text-surface-600 flex-shrink-0" />
                )}
                <span className={i <= step ? "text-surface-300" : "text-surface-700"}>{s}</span>
              </div>
            ))}
            {done && result && (
              <div className="mt-4 pt-4 border-t border-surface-800 space-y-1">
                <p className="text-brand-400">✓ Training selesai — {result.durasi}</p>
                <p className="text-surface-300">R² baru: <span className="text-brand-400">{result.r2}</span> | MAE: {result.mae} Jt | RMSE: {result.rmse} Jt</p>
              </div>
            )}
          </div>
        )}

        <button
          onClick={handleRetrain}
          disabled={running}
          className="btn-primary flex items-center justify-center gap-2 w-full py-3 disabled:opacity-50"
        >
          {running ? (
            <><Loader2 size={16} className="animate-spin" />Melatih Ulang Model...</>
          ) : (
            <><RefreshCw size={16} />Mulai Retrain</>
          )}
        </button>

        {done && (
          <div className="flex items-start gap-3 bg-brand-500/5 border border-brand-500/20 rounded-xl p-4">
            <CheckCircle size={16} className="text-brand-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-surface-300">
              Model <span className="text-brand-300 font-semibold">{model}</span> berhasil diperbarui.
              R² meningkat dari <span className="font-mono text-accent-amber">0.858</span> menjadi{" "}
              <span className="font-mono text-brand-400">0.879</span>.
            </p>
          </div>
        )}
      </div>

      {/* History */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-surface-800">
          <SectionHeader title="Riwayat Retraining" sub="5 training terakhir" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-800 bg-surface-900/50">
                <th className="table-th">Tanggal</th>
                <th className="table-th">Model</th>
                <th className="table-th">Dataset</th>
                <th className="table-th">R² Lama</th>
                <th className="table-th">R² Baru</th>
                <th className="table-th">Durasi</th>
                <th className="table-th">Status</th>
              </tr>
            </thead>
            <tbody>
              {retrainingHistory.map(r => (
                <tr key={r.id} className="table-row">
                  <td className="table-td text-surface-400">{r.tanggal}</td>
                  <td className="table-td font-display font-semibold text-surface-100">{r.model}</td>
                  <td className="table-td font-mono text-surface-400">{r.dataset}</td>
                  <td className="table-td font-mono text-surface-400">{r.r2Lama}</td>
                  <td className="table-td font-mono text-brand-400">{r.r2Baru}</td>
                  <td className="table-td font-mono text-surface-400">{r.durasi}</td>
                  <td className="table-td">
                    <span className={r.status === "sukses" ? "badge-green" : "badge-rose"}>
                      {r.status === "sukses" ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}