const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/otherControllers");
const { authMiddleware, adminOnly } = require("../middleware/auth");

router.get("/",  authMiddleware, ctrl.getInsights);
router.post("/", authMiddleware, adminOnly, ctrl.createInsight);

module.exports = router;
