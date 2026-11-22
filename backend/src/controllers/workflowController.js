const { getProjectById, projectExists, updateProject } = require("../models/projectModel");
const { getOutputByProjectId, upsertOutput } = require("../models/outputModel");
const { upsertWorkflow, getWorkflow: getWorkflowRecord } = require("../models/workflowModel");
const { upsertSummary } = require("../models/summaryModel");
const { upsertPpt } = require("../models/pptModel");
const { orchestratorAgent } = require("../services/agentsService");
const { WORKFLOW_STEPS } = require("../services/workflowService");
const { sendError, sendSuccess } = require("../utils/http");

function getWorkflow(req, res) {
  const projectId = Number(req.params.projectId);
  if (!projectExists(projectId)) return sendError(res, 404, "Project not found.");
  const wf = getWorkflowRecord(projectId);
  return sendSuccess(
    res,
    {
      steps: wf.steps?.length ? wf.steps : WORKFLOW_STEPS,
      status: wf.status
    },
    "Workflow fetched."
  );
}

function generateWorkflow(req, res) {
  const { projectId } = req.validated.body;
  if (!projectExists(projectId)) return sendError(res, 404, "Project not found.");

  const project = getProjectById(projectId);
  const generated = orchestratorAgent(project);
  updateProject(projectId, {
    objective: generated.objective,
    dataSources: generated.dataSources,
    workflowStatus: generated.workflowStatus
  });
  upsertWorkflow(projectId, generated.workflowStatus);
  upsertSummary(projectId, generated.summary.join("\n"));
  upsertPpt(projectId, generated.pptOutline.join("\n"));

  const output = upsertOutput(projectId, {
    summaryText: generated.summary.join("\n"),
    pptText: generated.pptOutline.join("\n"),
    riskText: generated.risks.join("\n"),
    judgeFeedbackText: generated.judgeFeedback.join("\n"),
    feasibilityText: generated.feasibility.join("\n"),
    mvpText: generated.mvp.join("\n"),
    featureText: generated.features.join("\n"),
    moduleText: generated.modules.join("\n")
  });

  req.app.get("io").emit("workflow:generated", { projectId });

  return sendSuccess(
    res,
    {
      objective: generated.objective,
      dataSources: generated.dataSources,
      workflowStatus: generated.workflowStatus,
      outputs: {
        summary: output.summary_text,
        ppt: output.ppt_text,
        risks: output.risk_text,
        judgeFeedback: output.judge_feedback_text,
        feasibility: output.feasibility_text,
        mvp: output.mvp_text,
        features: output.feature_text,
        modules: output.module_text
      }
    },
    "Workflow generated."
  );
}

module.exports = {
  getWorkflow,
  generateWorkflow
};
