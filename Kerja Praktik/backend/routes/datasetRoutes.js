const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/datasetController");
const { authMiddleware, adminOnly } = require("../middleware/auth");

router.get("/",          authMiddleware, ctrl.getAll);
router.get("/stats",     authMiddleware, ctrl.getStats);
router.post("/upload",   authMiddleware, adminOnly, ctrl.upload, ctrl.uploadCSV);
router.put("/:id",       authMiddleware, adminOnly, ctrl.updateRow);
router.delete("/:id",    authMiddleware, adminOnly, ctrl.deleteRow);

module.exports = router;
