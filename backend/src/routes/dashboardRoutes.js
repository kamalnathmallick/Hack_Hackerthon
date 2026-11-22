const express = require("express");
const { leaderDashboard, memberDashboard } = require("../controllers/dashboardController");
const { authMiddleware } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { validate } = require("../middleware/validateMiddleware");
const { dashboardSchema } = require("../utils/validators");

const router = express.Router();

router.use(authMiddleware);

router.get("/leader/dashboard/:userId", requireRole("TEAM_LEADER"), validate(dashboardSchema), leaderDashboard);
router.get("/member/dashboard/:userId", requireRole("TEAM_MEMBER"), validate(dashboardSchema), memberDashboard);

module.exports = router;
