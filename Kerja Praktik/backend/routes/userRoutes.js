const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/otherControllers");
const { authMiddleware, adminOnly } = require("../middleware/auth");

router.use(authMiddleware, adminOnly);
router.get("/",               ctrl.getAll);
router.post("/",              ctrl.create);
router.patch("/:id/status",   ctrl.toggleStatus);
router.patch("/:id/password", ctrl.resetPassword);

module.exports = router;
