const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/retrainController");
const { authMiddleware, adminOnly } = require("../middleware/auth");

router.post("/",          authMiddleware, adminOnly, ctrl.startRetrain);
router.get("/history",    authMiddleware, ctrl.getHistory);
router.get("/status/:id", authMiddleware, ctrl.getStatus);

module.exports = router;
