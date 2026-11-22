const express = require("express");
const { createSummaryHandler, getSummaryHandler } = require("../services/summaryService");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createSummaryHandler);
router.get("/:projectId", getSummaryHandler);

module.exports = router;
