const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/monitoringController");
const { authMiddleware } = require("../middleware/auth");

router.get("/", authMiddleware, ctrl.getMonitoring);

module.exports = router;
