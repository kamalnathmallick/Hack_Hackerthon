const express = require("express");
const { 
  register, 
  login, 
  me, 
  listMembers, 
  forgotPassword, 
  resetPassword, 
  changePassword 
} = require("../controllers/authController");
const { validate } = require("../middleware/validateMiddleware");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { registerSchema, loginSchema } = require("../utils/validators");

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/change-password", authMiddleware, changePassword);
router.get("/me", authMiddleware, me);
router.get("/members", authMiddleware, requireRole("TEAM_LEADER"), listMembers);

module.exports = router;
