// ─── Axios instance ──────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function request(method, path, body = null, isFormData = false) {
  const token = localStorage.getItem("token");
  const headers = {};

  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isFormData) headers["Content-Type"] = "application/json";

  const opts = { method, headers };
  if (body) opts.body = isFormData ? body : JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${path}`, opts);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

const get  = (path)       => request("GET",    path);
const post = (path, body, isFormData) => request("POST",   path, body, isFormData);
const put  = (path, body) => request("PUT",    path, body);
const del  = (path)       => request("DELETE", path);
const patch = (path, body) => request("PATCH", path, body);

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const apiLogin    = (email, password) => post("/auth/login",    { email, password });
export const apiRegister = (nama, email, password) => post("/auth/register", { nama, email, password });
export const apiMe       = () => get("/auth/me");

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const apiDashboardStats = () => get("/dashboard/stats");

// ─── Prediksi ─────────────────────────────────────────────────────────────────
export const apiPredict = (payload) => post("/prediksi", payload);
export const apiRiwayat = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return get(`/prediksi/riwayat${qs ? "?" + qs : ""}`);
};

// ─── Dataset ──────────────────────────────────────────────────────────────────
export const apiDatasetAll   = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return get(`/dataset${qs ? "?" + qs : ""}`);
};
export const apiDatasetStats  = () => get("/dataset/stats");
export const apiDatasetDelete = (id) => del(`/dataset/${id}`);
export const apiDatasetUpdate = (id, body) => put(`/dataset/${id}`, body);
export const apiDatasetUpload = (formData) => post("/dataset/upload", formData, true);

// ─── Model ────────────────────────────────────────────────────────────────────
export const apiModels      = () => get("/model");
export const apiModelActive = () => get("/model/active");
export const apiModelR2Hist = () => get("/model/r2-history");
export const apiSetActive   = (model_name) => post("/model/set-active", { model_name });

// ─── Monitoring ───────────────────────────────────────────────────────────────
export const apiMonitoring = () => get("/monitoring");

// ─── Retrain ──────────────────────────────────────────────────────────────────
export const apiStartRetrain  = (body) => post("/retrain", body);
export const apiRetrainHistory = () => get("/retrain/history");
export const apiRetrainStatus  = (id) => get(`/retrain/status/${id}`);

// ─── Insight ──────────────────────────────────────────────────────────────────
export const apiInsights       = () => get("/insight");
export const apiCreateInsight  = (body) => post("/insight", body);

// ─── Analisis ─────────────────────────────────────────────────────────────────
export const apiAnalisis = () => get("/analisis");

// ─── Users ────────────────────────────────────────────────────────────────────
export const apiUsers          = () => get("/users");
export const apiToggleStatus   = (id) => patch(`/users/${id}/status`);
export const apiResetPassword  = (id, password) => patch(`/users/${id}/password`, { password });
export const apiCreateUser     = (body) => post("/users", body);