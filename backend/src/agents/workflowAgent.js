const { createWorkflowStep } = require("../models/workflowModel");
const { callGeminiStructured, Type } = require("../config/gemini");

/**
 * Workflow Agent:
 * Synthesizes the analysis, feasibility, and roadmap to produce tailored,
 * sequential workflow stages with actionable technical descriptions,
 * then persists them to the database.
 */
async function workflowAgent(project, analysis, feasibility, roadmap) {
  const context = `Project: "${project.title}"
Problem: "${project.problem_statement || ""}"
${analysis ? `Breakdown: ${analysis.breakdown}\nObjectives: ${analysis.objectives}` : ""}
${feasibility ? `Tech Feasibility: ${feasibility.technicalFeasibility}` : ""}`;

  const prompt = `You are a Systems Orchestration Architect. Design a 6-to-8 step sequential execution workflow for:
${context}

Generate steps that cover the full lifecycle: requirement validation, architecture, AI/core pipeline, frontend integration, testing/hardening, and demo delivery.
Each step must have:
- step_name: Concise, professional title (e.g., "Problem Intake & Analysis", "Data Modeling & Schema Migration", "AI Engine Orchestration", "Frontend UI & Real-Time Sync", "System Hardening & Quality Assurance", "Presentation Deck & Demo Preparation").
- step_description: A clear 1-2 sentence technical summary of exactly what gets executed in this step.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      steps: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            step_name: { type: Type.STRING },
            step_description: { type: Type.STRING }
          },
          required: ["step_name", "step_description"]
        },
        description: "Sequential list of workflow steps tailored to this project."
      }
    },
    required: ["steps"]
  };

  const fallbackFn = () => ({
    steps: [
      {
        step_name: "Problem Intake & Requirements Analysis",
        step_description: `Deconstruct "${project.title}" requirements, user pain points, and define core MVP milestones.`
      },
      {
        step_name: "Architecture & Relational Schema Modeling",
        step_description: "Design and apply PostgreSQL schemas with foreign key relationships and index optimizations."
      },
      {
        step_name: "Gemini AI Multi-Agent Pipeline",
        step_description: "Implement structured LLM agents using @google/genai with strict JSON Schema output validation."
      },
      {
        step_name: "API Routing & WebSocket State Streaming",
        step_description: "Expose Express REST endpoints and Socket.IO rooms for real-time progress broadcasting."
      },
      {
        step_name: "Frontend Dashboard & Reactive UI",
        step_description: "Construct Next.js pages with TailwindCSS, live task boards, and presentation deck viewers."
      },
      {
        step_name: "Security, RBAC & End-to-End Testing",
        step_description: "Enforce JWT authentication, role guards (TEAM_LEADER vs TEAM_MEMBER), and execute Jest suites."
      },
      {
        step_name: "Demo Deck Generation & Deployment",
        step_description: "Generate pitch presentation outlines and bundle production assets for hackathon showcase."
      }
    ]
  });

  const result = await callGeminiStructured({
    prompt,
    schema,
    systemInstruction: "You are a DevOps and solutions architect designing actionable workflow pipelines.",
    fallbackFn
  });

  const stepsList = Array.isArray(result.steps) && result.steps.length > 0 ? result.steps : fallbackFn().steps;

  for (const step of stepsList) {
    await createWorkflowStep({
      project_id: project.id,
      step_name: step.step_name,
      step_description: step.step_description
    });
  }

  return stepsList.map(s => s.step_name);
}

module.exports = { workflowAgent };
