import { useState, useCallback } from "react";
import { Search, Download, Loader2 } from "lucide-react";
import { SectionHeader } from "../components/ui";
import { formatRupiah } from "../data/mockData";
import { useApi } from "../hooks/useApi";
import { apiRiwayat } from "../utils/api";

const MODEL_BADGE = { RFR: "badge-orange", Ensemble: "badge-rose", DTR: "badge-purple" };

export default function Riwayat() {
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [modelFilter, setMF] = useState("Semua");
  const [page, setPage] = useState(1);

  const { data, loading } = useApi(useCallback(() => apiRiwayat({ search, model: modelFilter !== "Semua" ? modelFilter : "", page, limit: 30 }), [search, modelFilter, page]));

  const rows = data?.data || [];
  const total = data?.total || 0;
  const summary = data?.summary || [];

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };
  const handleModel = (m) => {
    setMF(m);
    setPage(1);
  };

  const totalPages = Math.ceil(total / 30) || 1;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="font-display font-bold text-2xl text-surface-50">{total.toLocaleString("id-ID")}</p>
          <p className="text-xs text-surface-500 mt-0.5">Total Prediksi</p>
        </div>
        {["RFR", "Ensemble", "DTR"].map((m) => {
          const found = summary.find((s) => s.model_digunakan === m);
          return (
            <div key={m} className="card p-4 text-center">
              <p className="font-display font-bold text-2xl text-surface-50">{found ? found.jumlah : "0"}</p>
              <p className="text-xs text-surface-500 mt-0.5">{m}</p>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-surface-800 flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
          <SectionHeader title="Riwayat Prediksi" sub={`${total.toLocaleString("id-ID")} record`} />
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <div className="flex items-center gap-2 bg-surface-900 border border-surface-800 rounded-xl px-3 py-2 w-44 focus-within:border-brand-500 transition-colors">
              <Search size={13} className="text-surface-500" />
              <input
                className="bg-transparent text-xs placeholder-surface-600 text-surface-300 focus:outline-none flex-1"
                placeholder="Cari ID / lokasi..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <div className="flex gap-1 bg-surface-900 p-1 rounded-xl border border-surface-800">
              {["Semua", "RFR", "Ensemble", "DTR"].map((m) => (
                <button key={m} onClick={() => handleModel(m)} className={`px-2.5 py-1 rounded-lg text-xs font-display transition-all ${modelFilter === m ? "bg-brand-500 text-surface-950" : "text-surface-400 hover:text-surface-200"}`}>
                  {m}
                </button>
              ))}
            </div>
            <button className="btn-ghost flex items-center gap-1.5">
              <Download size={13} />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={24} className="animate-spin text-brand-400" />
            </div>
          ) : (
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
                {rows.map((r) => (
                  <tr key={r.id} className="table-row">
                    <td className="table-td font-mono text-xs text-surface-500">{r.kode}</td>
                    <td className="table-td text-xs text-surface-400">{r.created_at ? new Date(r.created_at).toLocaleDateString("id-ID") : "—"}</td>
                    <td className="table-td text-surface-200">{r.user_nama}</td>
                    <td className="table-td font-medium text-surface-100">{r.lokasi}</td>
                    <td className="table-td font-mono text-xs text-surface-400">
                      {r.lt}/{r.lb}
                    </td>
                    <td className="table-td font-mono text-xs text-surface-400">
                      {r.kt}/{r.km}
                    </td>
                    <td className="table-td font-mono text-brand-400 font-semibold">{formatRupiah(r.harga_prediksi)}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 rounded-full bg-surface-800 overflow-hidden">
                          <div className="h-full rounded-full bg-brand-500" style={{ width: `${r.confidence}%` }} />
                        </div>
                        <span className="text-xs font-mono text-surface-300">{r.confidence}%</span>
                      </div>
                    </td>
                    <td className="table-td">
                      <span className={MODEL_BADGE[r.model_digunakan] ?? "badge-green"}>{r.model_digunakan}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="p-4 border-t border-surface-800 flex items-center justify-between text-xs text-surface-500 font-mono">
          <span>
            Halaman {page} dari {totalPages}
          </span>
          <div className="flex gap-2">
            <button className="btn-ghost py-1 px-3 text-xs" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ← Prev
            </button>
            <button className="btn-ghost py-1 px-3 text-xs" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
