const { callGeminiStructured, Type } = require("../config/gemini");

/**
 * Roadmap Agent:
 * Formulates a tailored, phased development roadmap mapping out key milestones
 * from inception to deployment.
 */
async function roadmapAgent(project, analysis = null, feasibility = null) {
  const context = `Project: "${project.title}"
Problem: "${project.problem_statement || ""}"
${analysis ? `Objectives: ${analysis.objectives}` : ""}
${feasibility ? `Time Estimate: ${feasibility.timeEstimate}` : ""}`;

  const prompt = `You are a Technical Project Director. Generate a concrete 4-to-5 phase roadmap for:
${context}

Each phase should have a clear title, timeline/sprint window, and specific technical milestones.
Return an array of phase strings in chronological order.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      phases: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "List of chronologically ordered roadmap phases with milestones."
      }
    },
    required: ["phases"]
  };

  const fallbackFn = () => ({
    phases: [
      `Phase 1: Problem Definition & Data Schema (Sprint 1) — Finalize entity models, database migration, and auth boundaries for "${project.title}".`,
      `Phase 2: Core Engine & AI Automation Pipeline (Sprint 2) — Integrate Google Gemini multi-agent workflows with structured JSON schemas.`,
      `Phase 3: Real-Time Communication & Frontend UI (Sprint 3) — Build Next.js dashboards with Socket.IO event listeners for live progress.`,
      `Phase 4: Testing, Performance & Security Audit (Sprint 4) — Rigorous role-based access checks, edge-case validation, and load testing.`,
      `Phase 5: Production Deployment & Pitch Deck (Sprint 5) — Cloud hosting, CI/CD pipelines, and automated slide generation for stakeholders.`
    ]
  });

  const result = await callGeminiStructured({
    prompt,
    schema,
    systemInstruction: "You are an elite agile project manager and engineering manager. Return concise, actionable phases.",
    fallbackFn
  });

  return Array.isArray(result.phases) ? result.phases : fallbackFn().phases;
}

module.exports = { roadmapAgent };
