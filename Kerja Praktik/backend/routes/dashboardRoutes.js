const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/dashboardController");
const { authMiddleware } = require("../middleware/auth");

router.get("/stats", authMiddleware, ctrl.getStats);

module.exports = router;
