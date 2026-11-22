const express = require("express");
const { 
  createTaskHandler, 
  getTasksHandler, 
  updateTaskHandler, 
  deleteTaskHandler 
} = require("../services/taskService");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createTaskHandler);
router.get("/project/:projectId", getTasksHandler);
router.put("/:id", updateTaskHandler);
router.delete("/:id", deleteTaskHandler);

module.exports = router;
