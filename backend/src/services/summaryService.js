const { createSummary, getSummaryByProject } = require("../models/summaryModel");

async function createSummaryHandler(req, res) {
  try {
    const summary = await createSummary(req.body);
    res.status(201).json({ success: true, summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getSummaryHandler(req, res) {
  try {
    const summary = await getSummaryByProject(req.params.projectId);
    res.json({ success: true, summary, data: summary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  createSummaryHandler,
  getSummaryHandler
};
