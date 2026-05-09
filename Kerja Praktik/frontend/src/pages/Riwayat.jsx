import { useState } from "react";
import { Search, Download, Filter, History } from "lucide-react";
import { SectionHeader } from "../components/ui";
import { riwayatPrediksi, formatRupiah } from "../data/mockData";

const MODEL_BADGE = {
  RFR:      "badge-orange",
  Ensemble: "badge-rose",
  DTR:      "badge-purple",
};

export default function Riwayat() {
  const [search, setSearch]   = useState("");
  const [modelFilter, setMF]  = useState("Semua");

  const filtered = riwayatPrediksi.filter(r => {
    const matchSearch = r.lokasi.toLowerCase().includes(search.toLowerCase()) || r.id.includes(search);
    const matchModel  = modelFilter === "Semua" || r.model === modelFilter;
    return matchSearch && matchModel;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Prediksi", value: riwayatPrediksi.length },
          { label: "RFR",      value: riwayatPrediksi.filter(r => r.model === "RFR").length },
          { label: "Ensemble", value: riwayatPrediksi.filter(r => r.model === "Ensemble").length },
          { label: "DTR",      value: riwayatPrediksi.filter(r => r.model === "DTR").length },
        ].map(({ label, value }) => (
          <div key={label} className="card p-4 text-center">
            <p className="font-display font-bold text-2xl text-surface-50">{value}</p>
            <p className="text-xs text-surface-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-surface-800 flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
          <SectionHeader title="Riwayat Prediksi" sub={`${filtered.length} record`} />
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <div className="flex items-center gap-2 bg-surface-900 border border-surface-800 rounded-xl px-3 py-2 w-44 focus-within:border-brand-500 transition-colors">
              <Search size={13} className="text-surface-500" />
              <input
                className="bg-transparent text-xs placeholder-surface-600 text-surface-300 focus:outline-none flex-1"
                placeholder="Cari ID / lokasi..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {/* Model filter */}
            <div className="flex gap-1 bg-surface-900 p-1 rounded-xl border border-surface-800">
              {["Semua", "RFR", "Ensemble", "DTR"].map(m => (
                <button
                  key={m}
                  onClick={() => setMF(m)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-display transition-all ${
                    modelFilter === m ? "bg-brand-500 text-surface-950" : "text-surface-400 hover:text-surface-200"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
            <button className="btn-ghost flex items-center gap-1.5">
              <Download size={13} />Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-800 bg-surface-900/50">
                <th className="table-th">ID</th>
                <th className="table-th">Tanggal</th>
                <th className="table-th">User</th>
                <th className="table-th">Lokasi</th>
                <th className="table-th">LT/LB</th>
                <th className="table-th">KT/KM</th>
                <th className="table-th">Prediksi</th>
                <th className="table-th">Confidence</th>
                <th className="table-th">Model</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="table-row">
                  <td className="table-td font-mono text-xs text-surface-500">{r.id}</td>
                  <td className="table-td text-xs text-surface-400">{r.tanggal}</td>
                  <td className="table-td text-surface-200">{r.user}</td>
                  <td className="table-td font-medium text-surface-100">{r.lokasi}</td>
                  <td className="table-td font-mono text-xs text-surface-400">{r.lt}/{r.lb}</td>
                  <td className="table-td font-mono text-xs text-surface-400">{r.kt}/{r.km}</td>
                  <td className="table-td font-mono text-brand-400 font-semibold">{formatRupiah(r.hargaPred)}</td>
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-surface-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-brand-500"
                          style={{ width: `${r.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono text-surface-300">{r.confidence}%</span>
                    </div>
                  </td>
                  <td className="table-td">
                    <span className={MODEL_BADGE[r.model] ?? "badge-green"}>{r.model}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-surface-800 text-xs text-surface-500 font-mono">
          Menampilkan {filtered.length} dari {riwayatPrediksi.length} prediksi
        </div>
      </div>
    </div>
  );
}