const { problemAnalysisAgent } = require("./problemAnalysisAgent");
const { feasibilityAgent } = require("./feasibilityAgent");
const { roadmapAgent } = require("./roadmapAgent");
const { workflowAgent } = require("./workflowAgent");
const { taskAgent } = require("./taskAgent");
const { riskAgent } = require("./riskAgent");
const { summaryAgent } = require("./summaryAgent");
const { pptAgent } = require("./pptAgent");

/**
 * Orchestrator Agent:
 * Coordinates the multi-agent pipeline using Google Gemini AI, streaming live progress
 * updates across Socket.IO rooms (`project:${projectId}`) and persisting domain deliverables to PostgreSQL.
 *
 * Emits real-time events:
 * - agent:status
 * - agent:step_complete
 * - agent:done
 * - agent:error
 */
async function orchestratorAgent(project, io) {
  const projectId = project.id;
  const projectRoom = `project:${projectId}`;

  const emitStatus = (step, totalSteps, agentName, message) => {
    console.log(`[Orchestrator] Step ${step}/${totalSteps}: ${agentName} — ${message}`);
    if (io) {
      io.to(projectRoom).emit("agent:status", {
        projectId,
        step,
        totalSteps,
        agent: agentName,
        message
      });
      // Also emit project.agent.step for legacy listeners
      io.to(projectRoom).emit("project.agent.step", {
        projectId,
        step,
        totalSteps,
        agent: agentName,
        message
      });
    }
  };

  const emitStepComplete = (step, totalSteps, agentName, message, data = null) => {
    if (io) {
      io.to(projectRoom).emit("agent:step_complete", {
        projectId,
        step,
        totalSteps,
        agent: agentName,
        message,
        data
      });
    }
  };

  if (io) {
    io.to(projectRoom).emit("agent:status", {
      projectId,
      step: 0,
      totalSteps: 7,
      agent: "OrchestratorAgent",
      message: `Initiating multi-agent pipeline for "${project.title}"...`
    });
  }

  const TOTAL_STEPS = 7;

  try {
    // Step 1: Problem Analysis
    emitStatus(1, TOTAL_STEPS, "ProblemAnalysisAgent", "Analyzing root pain points, target users, and MVP boundaries...");
    const analysis = await problemAnalysisAgent(project);
    emitStepComplete(1, TOTAL_STEPS, "ProblemAnalysisAgent", "Problem breakdown and MVP scope defined", analysis);

    // Step 2: Feasibility & Tech Stack Assessment
    emitStatus(2, TOTAL_STEPS, "FeasibilityAgent", "Evaluating architectural feasibility and tech stack recommendations...");
    const feasibility = await feasibilityAgent(project, analysis);
    emitStepComplete(2, TOTAL_STEPS, "FeasibilityAgent", "Feasibility and stack evaluated", feasibility);

    // Step 3: Roadmap Generation
    emitStatus(3, TOTAL_STEPS, "RoadmapAgent", "Formulating phased development milestones and timelines...");
    const roadmap = await roadmapAgent(project, analysis, feasibility);
    emitStepComplete(3, TOTAL_STEPS, "RoadmapAgent", "Development roadmap formulated", roadmap);

    // Step 4: Workflow Formulation & Persistence
    emitStatus(4, TOTAL_STEPS, "WorkflowAgent", "Creating and persisting sequential workflow execution steps...");
    await workflowAgent(project, analysis, feasibility, roadmap);
    emitStepComplete(4, TOTAL_STEPS, "WorkflowAgent", "Execution steps stored in database");

    // Step 5: Task Decomposition & Smart Member Assignment
    emitStatus(5, TOTAL_STEPS, "TaskAgent", "Decomposing into granular technical tasks and balancing team assignments...");
    const createdTasks = await taskAgent(project, analysis, feasibility);
    emitStepComplete(5, TOTAL_STEPS, "TaskAgent", "Tasks balanced and delegated across team members", createdTasks);

    // Step 6: Risk Analysis & Mitigation
    emitStatus(6, TOTAL_STEPS, "RiskAgent", "Identifying critical technical, operational, and delivery risks...");
    const risks = await riskAgent(project, analysis, feasibility);
    emitStepComplete(6, TOTAL_STEPS, "RiskAgent", "Risk matrix with concrete mitigations established", risks);

    // Step 7: Executive Summary & Presentation Pitch Deck
    emitStatus(7, TOTAL_STEPS, "SummaryAndPPTAgents", "Synthesizing executive summary and compiling competition pitch deck...");
    const summaryText = await summaryAgent(project, analysis, feasibility, roadmap, risks);
    const pptResult = await pptAgent(project, summaryText, analysis, feasibility, risks, roadmap);
    emitStepComplete(7, TOTAL_STEPS, "SummaryAndPPTAgents", "Pitch deck and summary published", pptResult);

    console.log(`[Orchestrator] Multi-agent pipeline completed successfully for project #${projectId}`);

    if (io) {
      io.to(projectRoom).emit("agent:done", {
        projectId,
        title: project.title,
        success: true,
        message: "All 7 agents completed pipeline execution successfully!"
      });
      // Also emit project.processing.completed for legacy listeners
      io.to(projectRoom).emit("project.processing.completed", {
        projectId,
        title: project.title,
        success: true
      });
    }

    return {
      success: true,
      projectId,
      analysis,
      feasibility,
      roadmap,
      risks,
      summaryText,
      pptResult
    };
  } catch (error) {
    console.error(`[Orchestrator] Pipeline failed for project #${projectId}:`, error);
    if (io) {
      io.to(projectRoom).emit("agent:error", {
        projectId,
        error: error.message || "Pipeline execution failed"
      });
    }
    throw error;
  }
}

module.exports = { orchestratorAgent };
