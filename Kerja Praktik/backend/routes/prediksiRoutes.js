const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/prediksiController");
const { authMiddleware } = require("../middleware/auth");

router.post("/",        authMiddleware, ctrl.predict);
router.get("/riwayat",  authMiddleware, ctrl.getRiwayat);

module.exports = router;
