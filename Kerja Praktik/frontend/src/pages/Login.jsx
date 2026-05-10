import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Cpu, Loader2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login }           = useAuth();
  const navigate            = useNavigate();
  const [email, setEmail]   = useState("");
  const [pass, setPass]     = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, pass);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-glow-teal">
            <Cpu size={20} className="text-surface-950" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-2xl text-surface-50">
            Rumah<span className="text-brand-400">AI</span>
          </span>
        </div>

        <div className="card p-6 space-y-5">
          <div className="text-center mb-2">
            <h1 className="section-title text-lg">Masuk ke Dashboard</h1>
            <p className="text-xs text-surface-500 mt-1">Prediksi Harga Properti Bandung</p>
          </div>

          {error && (
            <div className="bg-accent-rose/10 border border-accent-rose/30 rounded-xl p-3 text-sm text-accent-rose text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="admin@rumahai.id"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={pass}
                onChange={e => setPass(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <><Loader2 size={16} className="animate-spin" />Masuk...</> : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}