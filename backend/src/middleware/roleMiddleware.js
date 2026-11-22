const { sendError } = require("../utils/http");

function normalizeRole(role) {
  const upper = String(role || "").trim().toUpperCase();
  if (upper === "LEADER" || upper === "TEAM_LEADER") return "TEAM_LEADER";
  if (upper === "MEMBER" || upper === "TEAM_MEMBER") return "TEAM_MEMBER";
  return upper;
}

function requireRole(...roles) {
  const allowedRoles = roles.map(normalizeRole);
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized.");
    }
    const userRole = normalizeRole(req.user.role);
    if (!allowedRoles.includes(userRole)) {
      return sendError(res, 403, "Forbidden.");
    }
    return next();
  };
}

module.exports = {
  requireRole,
  normalizeRole
};
