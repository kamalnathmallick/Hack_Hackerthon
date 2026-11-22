const express = require("express");
const { createProgressHandler, getProgressHandler } = require("../services/progressService");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createProgressHandler);
router.get("/:projectId", getProgressHandler);

module.exports = router;
