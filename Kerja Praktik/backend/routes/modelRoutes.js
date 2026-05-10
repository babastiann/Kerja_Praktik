const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/modelController");
const { authMiddleware, adminOnly } = require("../middleware/auth");

router.get("/",            authMiddleware, ctrl.getAll);
router.get("/active",      authMiddleware, ctrl.getActive);
router.get("/r2-history",  authMiddleware, ctrl.getR2History);
router.post("/set-active", authMiddleware, adminOnly, ctrl.setActive);

module.exports = router;
