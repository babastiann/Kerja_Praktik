import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { apiLogin, apiMe } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Cek sesi aktif saat load
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    apiMe()
      .then(u => setUser(u))
      .catch(() => { localStorage.removeItem("token"); setToken(null); })
      .finally(() => setLoading(false));
  }, [token]);

  const login = useCallback(async (email, password) => {
    const data = await apiLogin(email, password);
    localStorage.setItem("token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);