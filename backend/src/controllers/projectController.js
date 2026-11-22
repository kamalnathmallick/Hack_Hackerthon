const {
  createProject,
  getProjectById,
  getProjectsForUser,
  updateProject,
  projectExists
} = require("../models/projectModel");
const { getTasksByProjectId } = require("../models/taskModel");
const { createTask } = require("../models/taskModel");
const { findMembers } = require("../models/userModel");
const { getProgressByProjectId, upsertProgress } = require("../models/progressLegacyModel");
const { getOutputByProjectId, upsertOutput } = require("../models/outputModel");
const { upsertWorkflow } = require("../models/workflowModel");
const { getSummary, upsertSummary } = require("../models/summaryModel");
const { getPpt, upsertPpt } = require("../models/pptModel");
const { sendError, sendSuccess } = require("../utils/http");
const { orchestratorAgent } = require("../services/agentsService");

function createProjectHandler(req, res) {
  const { title, problemStatement, description, objective, dataSources } = req.validated.body;
  const generated = orchestratorAgent({
    title,
    problem_statement: problemStatement,
    description: description || "",
    objective: objective || ""
  });

  const project = createProject({
    title,
    problemStatement,
    description,
    objective: objective || generated.objective,
    dataSources: dataSources?.length ? dataSources : generated.dataSources,
    workflowStatus: generated.workflowStatus,
    createdBy: req.user.id
  });

  upsertProgress({
    projectId: project.id,
    progressValue: 8,
    note: "Agents initialized workflow from problem statement."
  });

  upsertWorkflow(project.id, generated.workflowStatus);
  upsertSummary(project.id, generated.summary.join("\n"));
  upsertPpt(project.id, generated.pptOutline.join("\n"));

  upsertOutput(project.id, {
    summaryText: generated.summary.join("\n"),
    pptText: generated.pptOutline.join("\n"),
    riskText: generated.risks.join("\n"),
    judgeFeedbackText: generated.judgeFeedback.join("\n"),
    feasibilityText: generated.feasibility.join("\n"),
    mvpText: generated.mvp.join("\n"),
    featureText: generated.features.join("\n"),
    moduleText: generated.modules.join("\n")
  });

  const members = findMembers();
  if (members.length) {
    generated.taskSuggestions.forEach((suggestion, idx) => {
      const member = members[idx % members.length];
      createTask({
        projectId: project.id,
        assignedTo: member.id,
        title: `${suggestion.domain}: ${suggestion.title}`,
        description: suggestion.description,
        instructions: suggestion.instructions,
        priority: suggestion.priority,
        status: "Assigned"
      });
    });
    upsertProgress({
      projectId: project.id,
      progressValue: 18,
      note: "Initial AI-generated tasks assigned to team members."
    });
  }

  const io = req.app.get("io");
  io.emit("project:created", { projectId: project.id, title: project.title });
  io.emit("workflow:generated", { projectId: project.id });
  io.emit("task:assigned", { projectId: project.id });

  return sendSuccess(
    res,
    { ...project, agentExecution: generated.agents, autoTasksCreated: generated.taskSuggestions.length },
    "Project created and agent pipeline executed."
  );
}

function getProjectsHandler(req, res) {
  const data = getProjectsForUser(req.user);
  return sendSuccess(res, data, "Projects fetched.");
}

function getProjectByIdHandler(req, res) {
  const id = Number(req.params.id);
  const project = getProjectById(id);
  if (!project) return sendError(res, 404, "Project not found.");

  if (req.user.role === "TEAM_MEMBER") {
    const myTasks = getTasksByProjectId(id).filter((task) => task.assigned_to === req.user.id);
    if (myTasks.length === 0) return sendError(res, 403, "Forbidden project access.");
  }

  let tasks = getTasksByProjectId(id);
  if (req.user.role === "TEAM_MEMBER") {
    tasks = tasks.filter((task) => task.assigned_to === req.user.id);
  }
  const progress = getProgressByProjectId(id);
  const outputs = getOutputByProjectId(id);
  return sendSuccess(res, { project, tasks, progress, outputs }, "Project details fetched.");
}

function updateProjectHandler(req, res) {
  const id = Number(req.params.id);
  if (!projectExists(id)) return sendError(res, 404, "Project not found.");
  const updated = updateProject(id, req.validated.body);
  const io = req.app.get("io");
  io.emit("project:updated", { projectId: id });
  return sendSuccess(res, updated, "Project updated.");
}

function getProjectSummary(req, res) {
  const id = Number(req.params.id || req.params.projectId);
  if (!projectExists(id)) return sendError(res, 404, "Project not found.");
  const output = getSummary(id);
  return sendSuccess(res, { summaryText: output?.content || "" }, "Summary fetched.");
}

function postProjectSummary(req, res) {
  const id = Number(req.params.id || req.params.projectId);
  if (!projectExists(id)) return sendError(res, 404, "Project not found.");
  const project = getProjectById(id);
  const generated = orchestratorAgent(project);
  upsertSummary(id, generated.summary.join("\n"));
  const output = upsertOutput(id, {
    ...mapOutputToPayload(getOutputByProjectId(id)),
    summaryText: generated.summary.join("\n"),
    riskText: generated.risks.join("\n"),
    judgeFeedbackText: generated.judgeFeedback.join("\n")
  });
  req.app.get("io").emit("summary:generated", { projectId: id });
  return sendSuccess(res, { summaryText: generated.summary.join("\n"), output }, "Summary generated.");
}

function getProjectPpt(req, res) {
  const id = Number(req.params.id || req.params.projectId);
  if (!projectExists(id)) return sendError(res, 404, "Project not found.");
  const output = getPpt(id);
  return sendSuccess(res, { pptText: output?.content || "" }, "PPT outline fetched.");
}

function postProjectPpt(req, res) {
  const id = Number(req.params.id || req.params.projectId);
  if (!projectExists(id)) return sendError(res, 404, "Project not found.");
  const project = getProjectById(id);
  const generated = orchestratorAgent(project);
  upsertPpt(id, generated.pptOutline.join("\n"));
  const output = upsertOutput(id, {
    ...mapOutputToPayload(getOutputByProjectId(id)),
    pptText: generated.pptOutline.join("\n")
  });
  req.app.get("io").emit("ppt:generated", { projectId: id });
  return sendSuccess(res, { pptText: generated.pptOutline.join("\n"), output }, "PPT outline generated.");
}

function getProgress(req, res) {
  const id = Number(req.params.id || req.params.projectId);
  if (!projectExists(id)) return sendError(res, 404, "Project not found.");
  const progress = getProgressByProjectId(id);
  return sendSuccess(res, progress, "Progress fetched.");
}

function postProgress(req, res) {
  const id = Number(req.params.id || req.params.projectId);
  if (!projectExists(id)) return sendError(res, 404, "Project not found.");
  const { progressValue, note } = req.validated.body;
  const progress = upsertProgress({ projectId: id, progressValue, note });
  req.app.get("io").emit("progress:updated", { projectId: id, progress });
  return sendSuccess(res, progress, "Progress updated.");
}

function mapOutputToPayload(output) {
  return {
    summaryText: output.summary_text,
    pptText: output.ppt_text,
    riskText: output.risk_text,
    judgeFeedbackText: output.judge_feedback_text,
    feasibilityText: output.feasibility_text,
    mvpText: output.mvp_text,
    featureText: output.feature_text,
    moduleText: output.module_text
  };
}

module.exports = {
  createProjectHandler,
  getProjectsHandler,
  getProjectByIdHandler,
  updateProjectHandler,
  getProjectSummary,
  postProjectSummary,
  getProjectPpt,
  postProjectPpt,
  getProgress,
  postProgress
};
