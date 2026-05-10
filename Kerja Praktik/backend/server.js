const express  = require("express");
const cors     = require("cors");
require("dotenv").config();

const app = express();

// ── Middleware ─────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use("/uploads", express.static("uploads"));

// ── Health check ───────────────────────────────────────────
app.get("/", (_req, res) => res.json({ message: "API Rumah Bandung — OK", version: "1.0.0" }));

// ── Routes ─────────────────────────────────────────────────
app.use("/api/auth",       require("./routes/authRoutes"));
app.use("/api/users",      require("./routes/userRoutes"));
app.use("/api/dataset",    require("./routes/datasetRoutes"));
app.use("/api/prediksi",   require("./routes/prediksiRoutes"));
app.use("/api/model",      require("./routes/modelRoutes"));
app.use("/api/monitoring", require("./routes/monitoringRoutes"));
app.use("/api/retrain",    require("./routes/retrainRoutes"));
app.use("/api/insight",    require("./routes/insightRoutes"));
app.use("/api/dashboard",  require("./routes/dashboardRoutes"));
app.use("/api/analisis",   require("./routes/analisisRoutes"));

// ── Global error handler ───────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("[ERROR]", err.message);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

// ── Start ──────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
