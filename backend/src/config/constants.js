const ROLES = Object.freeze({
  TEAM_LEADER: "TEAM_LEADER",
  TEAM_MEMBER: "TEAM_MEMBER"
});

const TASK_STATUSES = ["Pending", "Assigned", "In Progress", "Completed", "Blocked"];
const TASK_PRIORITIES = ["Low", "Medium", "High", "Critical"];

const WORKFLOW_STEPS = [
  "Problem Intake",
  "Problem Analysis",
  "Feasibility Checking",
  "MVP Planning",
  "Feature Selection",
  "Workflow Generation",
  "Module Breakdown",
  "Risk Detection",
  "Judge Simulation",
  "Project Summary",
  "PPT Generation"
];

module.exports = {
  ROLES,
  TASK_STATUSES,
  TASK_PRIORITIES,
  WORKFLOW_STEPS
};
