const express = require("express");
const { 
  createProjectHandler, 
  getAllProjectsHandler, 
  getProjectByIdHandler, 
  updateProjectHandler, 
  deleteProjectHandler 
} = require("../services/projectService");
const { downloadPptxHandler } = require("../services/pptExportService");
const { authMiddleware } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.post("/", createProjectHandler);
router.get("/", getAllProjectsHandler);
router.get("/:id/ppt/download", downloadPptxHandler);
router.get("/:id", getProjectByIdHandler);
router.put("/:id", updateProjectHandler);
router.delete("/:id", deleteProjectHandler);

module.exports = router;
