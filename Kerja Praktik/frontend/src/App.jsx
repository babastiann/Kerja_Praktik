import { Routes, Route, Navigate } from "react-router-dom";
import Layout     from "./components/layout/Layout";
import Login      from "./pages/Login";
import Dashboard  from "./pages/Dashboard";
import Prediksi   from "./pages/Prediksi";
import Analisis   from "./pages/Analisis";
import Model      from "./pages/Model";
import Monitoring from "./pages/Monitoring";
import Dataset    from "./pages/Dataset";
import Users      from "./pages/Users";
import Retrain    from "./pages/Retrain";
import Riwayat    from "./pages/Riwayat";
import Insight    from "./pages/Insight";
import { useAuth } from "./context/AuthContext";
import { Loader2 } from "lucide-react";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-brand-400" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index            element={<Dashboard />}  />
        <Route path="prediksi"  element={<Prediksi />}   />
        <Route path="analisis"  element={<Analisis />}   />
        <Route path="model"     element={<Model />}      />
        <Route path="monitoring" element={<Monitoring />} />
        <Route path="dataset"   element={<Dataset />}    />
        <Route path="users"     element={<Users />}      />
        <Route path="retrain"   element={<Retrain />}    />
        <Route path="riwayat"   element={<Riwayat />}   />
        <Route path="insight"   element={<Insight />}    />
      </Route>
    </Routes>
  );
}