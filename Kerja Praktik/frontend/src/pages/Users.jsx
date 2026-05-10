import { useState } from "react";
import { Users, Shield, UserX, Key, Search, Plus, Loader2 } from "lucide-react";
import { StatCard, SectionHeader } from "../components/ui";
import { useApi } from "../hooks/useApi";
import { apiUsers, apiToggleStatus, apiResetPassword, apiCreateUser } from "../utils/api";

export default function UserManagement() {
  const { data, loading, refetch } = useApi(apiUsers);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newUser, setNewUser] = useState({ nama: "", email: "", password: "", role: "user" });
  const [error, setError] = useState("");

  const users = data || [];
  const filtered = users.filter((u) => u.nama.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  const toggleStatus = async (id) => {
    try {
      await apiToggleStatus(id);
      refetch();
    } catch (e) {
      alert(e.message);
    }
  };

  const resetPass = async (id) => {
    const p = prompt("Password baru (min 6 karakter):");
    if (!p) return;
    try {
      await apiResetPassword(id, p);
      alert("Password berhasil direset");
    } catch (e) {
      alert(e.message);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await apiCreateUser(newUser);
      setShowAdd(false);
      setNewUser({ nama: "", email: "", password: "", role: "user" });
      refetch();
    } catch (e) {
      setError(e.message);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 size={28} className="animate-spin text-brand-400" />
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total User" value={users.length} icon={Users} color="teal" />
        <StatCard label="Aktif" value={users.filter((u) => u.status === "aktif").length} icon={Shield} color="teal" />
        <StatCard label="Nonaktif" value={users.filter((u) => u.status === "nonaktif").length} icon={UserX} color="rose" />
        <StatCard label="Admin" value={users.filter((u) => u.role === "admin").length} icon={Key} color="purple" />
      </div>

      {/* Add user modal */}
      {showAdd && (
        <div className="card p-6 space-y-4">
          <SectionHeader title="Tambah User Baru" />
          {error && <p className="text-sm text-accent-rose bg-accent-rose/10 border border-accent-rose/30 rounded-xl px-3 py-2">{error}</p>}
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Nama</label>
              <input className="input-field" value={newUser.nama} onChange={(e) => setNewUser((p) => ({ ...p, nama: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input-field" value={newUser.email} onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input-field" value={newUser.password} onChange={(e) => setNewUser((p) => ({ ...p, password: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Role</label>
              <select className="select-field" value={newUser.role} onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value }))}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="submit" className="btn-primary">
                Simpan
              </button>
              <button type="button" className="btn-ghost" onClick={() => setShowAdd(false)}>
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-surface-800 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <SectionHeader title="Daftar User" sub={`${filtered.length} pengguna`} />
          <div className="flex items-center gap-2 ml-auto w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-surface-900 border border-surface-800 rounded-xl px-3 py-2 flex-1 sm:w-52 focus-within:border-brand-500 transition-colors">
              <Search size={13} className="text-surface-500" />
              <input className="bg-transparent text-xs placeholder-surface-600 text-surface-300 focus:outline-none flex-1" placeholder="Cari nama / email..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button className="btn-primary flex items-center gap-1.5" onClick={() => setShowAdd(true)}>
              <Plus size={13} />
              Tambah
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-800 bg-surface-900/50">
                <th className="table-th">User</th>
                <th className="table-th">Role</th>
                <th className="table-th">Prediksi</th>
                <th className="table-th">Bergabung</th>
                <th className="table-th">Status</th>
                <th className="table-th">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="table-row">
                  <td className="table-td">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-brand-400 text-xs font-display font-bold">{u.nama[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-surface-100">{u.nama}</p>
                        <p className="text-xs text-surface-500 font-mono">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-td">
                    <span className={u.role === "admin" ? "badge-purple" : "badge-green"}>{u.role}</span>
                  </td>
                  <td className="table-td font-mono text-surface-200">{u.prediksi || 0}</td>
                  <td className="table-td text-surface-400">{u.bergabung}</td>
                  <td className="table-td">
                    <span className={u.status === "aktif" ? "badge-green" : "badge-rose"}>{u.status}</span>
                  </td>
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(u.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                          u.status === "aktif" ? "bg-accent-rose/10 border-accent-rose/30 text-accent-rose hover:bg-accent-rose/20" : "bg-brand-500/10 border-brand-500/30 text-brand-400 hover:bg-brand-500/20"
                        }`}
                      >
                        {u.status === "aktif" ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                      <button onClick={() => resetPass(u.id)} className="text-xs px-2.5 py-1 rounded-lg border border-surface-700 text-surface-400 hover:border-surface-600 transition-all">
                        Reset Pass
                      </button>
                    </div>
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
