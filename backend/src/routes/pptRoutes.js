const express = require("express");
const { createPPTHandler, getPPTHandler } = require("../services/pptService");
const { downloadPptxHandler } = require("../services/pptExportService");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createPPTHandler);
router.get("/:projectId/download", downloadPptxHandler);
router.get("/:projectId", getPPTHandler);

module.exports = router;
