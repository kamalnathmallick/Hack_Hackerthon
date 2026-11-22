const { getLeaderDashboard, getMemberDashboard } = require("../services/dashboardService");
const { sendError, sendSuccess } = require("../utils/http");

function leaderDashboard(req, res) {
  const userId = Number(req.params.userId);
  if (req.user.role !== "TEAM_LEADER" || req.user.id !== userId) {
    return sendError(res, 403, "Forbidden.");
  }
  const data = getLeaderDashboard(userId);
  return sendSuccess(res, data, "Leader dashboard fetched.");
}

function memberDashboard(req, res) {
  const userId = Number(req.params.userId);
  if (req.user.role !== "TEAM_MEMBER" || req.user.id !== userId) {
    return sendError(res, 403, "Forbidden.");
  }
  const data = getMemberDashboard(userId);
  return sendSuccess(res, data, "Member dashboard fetched.");
}

module.exports = {
  leaderDashboard,
  memberDashboard
};
