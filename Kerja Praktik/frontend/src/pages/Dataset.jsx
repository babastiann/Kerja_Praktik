import { useState, useCallback } from "react";
import { Upload, Search, Trash2, Edit2, CheckCircle, Filter, Loader2, X } from "lucide-react";
import { SectionHeader } from "../components/ui";
import { formatRupiah } from "../data/mockData";
import { useApi } from "../hooks/useApi";
import { apiDatasetAll, apiDatasetStats, apiDatasetDelete, apiDatasetUpdate, apiDatasetUpload } from "../utils/api";

export default function Dataset() {
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showUpload, setShowUpload]   = useState(false);
  const [dragOver, setDragOver]       = useState(false);
  const [editRow, setEditRow]         = useState(null);
  const [uploading, setUploading]     = useState(false);
  const [msg, setMsg]                 = useState("");

  const statsApi  = useApi(apiDatasetStats);
  const dataApi   = useApi(
    useCallback(() => apiDatasetAll({ page, limit: 20, search }), [page, search])
  );

  const { data: statsData } = statsApi;
  const { data, loading, refetch } = dataApi;

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const hapus = async (id) => {
    if (!confirm("Yakin hapus data ini?")) return;
    try {
      await apiDatasetDelete(id);
      refetch();
      statsApi.refetch();
    } catch (e) { alert(e.message); }
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setMsg("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await apiDatasetUpload(fd);
      setMsg(res.message);
      setShowUpload(false);
      refetch();
      statsApi.refetch();
    } catch (e) { setMsg("Upload gagal: " + e.message); }
    finally { setUploading(false); }
  };

  const rows       = data?.data || [];
  const total      = data?.total || 0;
  const totalPages = data?.totalPages || 1;

  return (
    <div className="space-y-6 animate-fade-in">
      {msg && (
        <div className="bg-brand-500/10 border border-brand-500/30 rounded-xl p-3 text-sm text-brand-300 flex items-center justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg("")}><X size={14} /></button>
        </div>
      )}

      {/* Upload area */}
      {showUpload && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files[0]); }}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 ${
            dragOver ? "border-brand-500 bg-brand-500/5" : "border-surface-700 bg-surface-900"
          }`}
        >
          <Upload size={32} className="mx-auto mb-3 text-surface-500" />
          <p className="font-display font-semibold text-surface-300">Drag & drop file CSV di sini</p>
          <p className="text-xs text-surface-500 mt-1">atau klik untuk memilih file</p>
          <div className="flex gap-3 justify-center mt-4">
            <label className="btn-primary cursor-pointer">
              {uploading ? <Loader2 size={14} className="animate-spin inline mr-1" /> : null}
              Pilih File
              <input type="file" accept=".csv,.xlsx" className="hidden" onChange={e => handleUpload(e.target.files[0])} />
            </label>
            <button className="btn-ghost" onClick={() => setShowUpload(false)}>Batal</button>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Baris",  value: Number(statsData?.total || 0).toLocaleString("id-ID"), color: "text-brand-400" },
          { label: "Valid",        value: Number(statsData?.valid || 0).toLocaleString("id-ID"), color: "text-brand-400" },
          { label: "Error / Null", value: Number(statsData?.invalid || 0).toLocaleString("id-ID"), color: "text-accent-rose" },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className={`font-display font-bold text-2xl ${color}`}>{value}</p>
            <p className="text-xs text-surface-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-surface-800 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <SectionHeader title="Tabel Dataset" sub={`${total.toLocaleString("id-ID")} baris total`} />
          <div className="flex items-center gap-2 ml-auto w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-surface-900 border border-surface-800 rounded-xl px-3 py-2 flex-1 sm:w-48 focus-within:border-brand-500 transition-colors">
              <Search size={13} className="text-surface-500" />
              <input
                className="bg-transparent text-xs text-surface-300 placeholder-surface-600 focus:outline-none flex-1"
                placeholder="Cari lokasi..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSearch()}
              />
            </div>
            <button className="btn-ghost flex items-center gap-1.5" onClick={handleSearch}>
              <Filter size={13} />Cari
            </button>
            <button className="btn-primary flex items-center gap-1.5" onClick={() => setShowUpload(true)}>
              <Upload size={13} />Upload CSV
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
                  <th className="table-th">Lokasi</th>
                  <th className="table-th">LT (m²)</th>
                  <th className="table-th">LB (m²)</th>
                  <th className="table-th">KT</th>
                  <th className="table-th">KM</th>
                  <th className="table-th">Garasi</th>
                  <th className="table-th">Harga</th>
                  <th className="table-th">Status</th>
                  <th className="table-th">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="table-row">
                    <td className="table-td font-mono text-surface-500">#{r.id}</td>
                    <td className="table-td font-medium text-surface-100">{r.lokasi}</td>
                    <td className="table-td font-mono">{r.lt}</td>
                    <td className="table-td font-mono">{r.lb}</td>
                    <td className="table-td font-mono">{r.kamar_tidur}</td>
                    <td className="table-td font-mono">{r.kamar_mandi}</td>
                    <td className="table-td font-mono">{r.garasi}</td>
                    <td className="table-td font-mono text-brand-400">{r.harga_numeric ? formatRupiah(r.harga_numeric) : "—"}</td>
                    <td className="table-td">
                      <span className={r.is_valid ? "badge-green" : "badge-rose"}>
                        <CheckCircle size={10} />{r.is_valid ? "valid" : "invalid"}
                      </span>
                    </td>
                    <td className="table-td">
                      <div className="flex items-center gap-2">
                        <button className="text-surface-500 hover:text-brand-400 transition-colors" onClick={() => setEditRow(r)}>
                          <Edit2 size={13} />
                        </button>
                        <button className="text-surface-500 hover:text-accent-rose transition-colors" onClick={() => hapus(r.id)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-surface-800 flex items-center justify-between text-xs text-surface-500 font-mono">
          <span>Halaman {page} dari {totalPages}</span>
          <div className="flex gap-2">
            <button className="btn-ghost py-1 px-3 text-xs" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            <button className="btn-ghost py-1 px-3 text-xs" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        </div>
      </div>
    </div>
  );
}