import { useState } from "react";
import { Upload, Search, Trash2, Edit2, CheckCircle, Filter } from "lucide-react";
import { SectionHeader } from "../components/ui";
import { datasetSamples, formatRupiah } from "../data/mockData";

export default function Dataset() {
  const [search, setSearch] = useState("");
  const [rows, setRows]     = useState(datasetSamples);
  const [showUpload, setShowUpload] = useState(false);
  const [dragOver, setDragOver]     = useState(false);

  const filtered = rows.filter(r =>
    r.lokasi.toLowerCase().includes(search.toLowerCase())
  );

  const hapus = (id) => setRows(r => r.filter(x => x.id !== id));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Upload area */}
      {showUpload && (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); setShowUpload(false); }}
          className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 ${
            dragOver ? "border-brand-500 bg-brand-500/5" : "border-surface-700 bg-surface-900"
          }`}
        >
          <Upload size={32} className="mx-auto mb-3 text-surface-500" />
          <p className="font-display font-semibold text-surface-300">Drag & drop file CSV di sini</p>
          <p className="text-xs text-surface-500 mt-1">atau klik untuk memilih file</p>
          <div className="flex gap-3 justify-center mt-4">
            <button className="btn-primary">Pilih File</button>
            <button className="btn-ghost" onClick={() => setShowUpload(false)}>Batal</button>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Baris",   value: "12.450", color: "text-brand-400" },
          { label: "Valid",         value: "12.380", color: "text-brand-400" },
          { label: "Error / Null",  value: "70",     color: "text-accent-rose" },
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
          <SectionHeader title="Tabel Dataset" sub={`${filtered.length} dari ${rows.length} baris`} />
          <div className="flex items-center gap-2 ml-auto w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-surface-900 border border-surface-800 rounded-xl px-3 py-2 flex-1 sm:w-48 focus-within:border-brand-500 transition-colors">
              <Search size={13} className="text-surface-500" />
              <input
                className="bg-transparent text-xs text-surface-300 placeholder-surface-600 focus:outline-none flex-1"
                placeholder="Cari lokasi..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button className="btn-ghost flex items-center gap-1.5">
              <Filter size={13} />Filter
            </button>
            <button className="btn-primary flex items-center gap-1.5" onClick={() => setShowUpload(true)}>
              <Upload size={13} />Upload CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
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
              {filtered.map(r => (
                <tr key={r.id} className="table-row">
                  <td className="table-td font-mono text-surface-500">#{r.id}</td>
                  <td className="table-td font-medium text-surface-100">{r.lokasi}</td>
                  <td className="table-td font-mono">{r.lt}</td>
                  <td className="table-td font-mono">{r.lb}</td>
                  <td className="table-td font-mono">{r.kt}</td>
                  <td className="table-td font-mono">{r.km}</td>
                  <td className="table-td font-mono">{r.garasi}</td>
                  <td className="table-td font-mono text-brand-400">{formatRupiah(r.harga)}</td>
                  <td className="table-td">
                    <span className="badge-green"><CheckCircle size={10} />valid</span>
                  </td>
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      <button className="text-surface-500 hover:text-brand-400 transition-colors">
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
        </div>
        <div className="p-4 border-t border-surface-800 text-xs text-surface-500 font-mono">
          Menampilkan {filtered.length} baris — halaman 1 dari 623
        </div>
      </div>
    </div>
  );
}