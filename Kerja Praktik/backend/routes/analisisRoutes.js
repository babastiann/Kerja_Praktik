const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/otherControllers");
const { authMiddleware } = require("../middleware/auth");

router.get("/", authMiddleware, ctrl.getAnalisis);

module.exports = router;
