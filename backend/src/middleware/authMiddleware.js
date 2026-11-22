const jwt = require("jsonwebtoken");
const { findUserById } = require("../models/userModel");

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Missing Bearer token." });
    }

    const token = authHeader.replace("Bearer ", "").trim();
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ success: false, message: "Server misconfiguration: JWT_SECRET missing." });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "User no longer exists." });
    }

    const roleUpper = String(user.role || "").toUpperCase();
    user.role = (roleUpper === "LEADER" || roleUpper === "TEAM_LEADER") ? "TEAM_LEADER" : "TEAM_MEMBER";

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }
}

module.exports = {
  authMiddleware
};
