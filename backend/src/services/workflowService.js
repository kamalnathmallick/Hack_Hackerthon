const { createWorkflowStep, getWorkflowByProject } = require("../models/workflowModel");

async function createWorkflowHandler(req, res) {
  try {
    const workflow = await createWorkflowStep(req.body);
    res.status(201).json({ success: true, workflow });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getWorkflowHandler(req, res) {
  try {
    const workflow = await getWorkflowByProject(req.params.projectId);
    res.json({ success: true, workflow, data: workflow });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  createWorkflowHandler,
  getWorkflowHandler
};
