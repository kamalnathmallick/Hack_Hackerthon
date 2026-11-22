const { createPPT, getPPTByProject } = require("../models/pptModel");

async function createPPTHandler(req, res) {
  try {
    const ppt = await createPPT(req.body);
    res.status(201).json({ success: true, ppt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getPPTHandler(req, res) {
  try {
    const ppt = await getPPTByProject(req.params.projectId);
    res.json({ success: true, ppt, data: ppt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  createPPTHandler,
  getPPTHandler
};
