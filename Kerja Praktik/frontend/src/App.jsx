import { Routes, Route } from "react-router-dom";
import Layout     from "./components/layout/Layout";
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index         element={<Dashboard />}  />
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