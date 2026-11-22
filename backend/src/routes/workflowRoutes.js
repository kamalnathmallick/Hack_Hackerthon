const express = require("express");
const { createWorkflowHandler, getWorkflowHandler } = require("../services/workflowService");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createWorkflowHandler);
router.get("/:projectId", getWorkflowHandler);

module.exports = router;
