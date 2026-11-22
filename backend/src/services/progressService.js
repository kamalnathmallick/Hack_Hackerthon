const { updateProgress, getProjectProgress } = require("../models/progressModel");

async function createProgressHandler(req, res) {
  try {
    const progress = await updateProgress(req.body);
    res.status(201).json({ success: true, progress });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getProgressHandler(req, res) {
  try {
    const progress = await getProjectProgress(req.params.projectId);
    res.json({ success: true, progress, data: progress });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  createProgressHandler,
  getProgressHandler
};
