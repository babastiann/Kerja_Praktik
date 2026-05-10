// ============================================================
//  ROUTES — Semua routes backend
//  Simpan masing-masing ke file sesuai nama di bawah
// ============================================================

// ──────────────────────────────────────────────────────
//  routes/authRoutes.js
// ──────────────────────────────────────────────────────
/*
const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/authController");
const { authMiddleware } = require("../middleware/auth");

router.post("/login",    ctrl.login);
router.post("/register", ctrl.register);
router.get("/me",        authMiddleware, ctrl.me);

module.exports = router;
*/

// ──────────────────────────────────────────────────────
//  routes/userRoutes.js
// ──────────────────────────────────────────────────────
/*
const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/otherControllers");
const { authMiddleware, adminOnly } = require("../middleware/auth");

router.use(authMiddleware, adminOnly);
router.get("/",                ctrl.getAll);
router.post("/",               ctrl.create);
router.patch("/:id/status",    ctrl.toggleStatus);
router.patch("/:id/password",  ctrl.resetPassword);

module.exports = router;
*/

// ──────────────────────────────────────────────────────
//  routes/datasetRoutes.js
// ──────────────────────────────────────────────────────
/*
const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/datasetController");
const { authMiddleware, adminOnly } = require("../middleware/auth");

router.get("/",           authMiddleware, ctrl.getAll);
router.get("/stats",      authMiddleware, ctrl.getStats);
router.post("/upload",    authMiddleware, adminOnly, ctrl.upload, ctrl.uploadCSV);
router.put("/:id",        authMiddleware, adminOnly, ctrl.updateRow);
router.delete("/:id",     authMiddleware, adminOnly, ctrl.deleteRow);

module.exports = router;
*/

// ──────────────────────────────────────────────────────
//  routes/prediksiRoutes.js
// ──────────────────────────────────────────────────────
/*
const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/prediksiController");
const { authMiddleware } = require("../middleware/auth");

router.post("/",           authMiddleware, ctrl.predict);
router.get("/riwayat",     authMiddleware, ctrl.getRiwayat);

module.exports = router;
*/

// ──────────────────────────────────────────────────────
//  routes/modelRoutes.js
// ──────────────────────────────────────────────────────
/*
const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/modelController");
const { authMiddleware, adminOnly } = require("../middleware/auth");

router.get("/",           authMiddleware, ctrl.getAll);
router.get("/active",     authMiddleware, ctrl.getActive);
router.get("/r2-history", authMiddleware, ctrl.getR2History);
router.post("/set-active",authMiddleware, adminOnly, ctrl.setActive);

module.exports = router;
*/

// ──────────────────────────────────────────────────────
//  routes/monitoringRoutes.js
// ──────────────────────────────────────────────────────
/*
const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/monitoringController");
const { authMiddleware } = require("../middleware/auth");

router.get("/", authMiddleware, ctrl.getMonitoring);

module.exports = router;
*/

// ──────────────────────────────────────────────────────
//  routes/retrainRoutes.js
// ──────────────────────────────────────────────────────
/*
const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/retrainController");
const { authMiddleware, adminOnly } = require("../middleware/auth");

router.post("/",           authMiddleware, adminOnly, ctrl.startRetrain);
router.get("/history",     authMiddleware, ctrl.getHistory);
router.get("/status/:id",  authMiddleware, ctrl.getStatus);

module.exports = router;
*/

// ──────────────────────────────────────────────────────
//  routes/insightRoutes.js
// ──────────────────────────────────────────────────────
/*
const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/otherControllers");
const { authMiddleware, adminOnly } = require("../middleware/auth");

router.get("/",  authMiddleware, ctrl.getInsights);
router.post("/", authMiddleware, adminOnly, ctrl.createInsight);

module.exports = router;
*/

// ──────────────────────────────────────────────────────
//  routes/dashboardRoutes.js
// ──────────────────────────────────────────────────────
/*
const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/dashboardController");
const { authMiddleware } = require("../middleware/auth");

router.get("/stats", authMiddleware, ctrl.getStats);

module.exports = router;
*/

// ──────────────────────────────────────────────────────
//  routes/analisisRoutes.js
// ──────────────────────────────────────────────────────
/*
const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/otherControllers");
const { authMiddleware } = require("../middleware/auth");

router.get("/", authMiddleware, ctrl.getAnalisis);

module.exports = router;
*/
