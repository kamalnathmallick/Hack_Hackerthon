const { callGeminiStructured, Type } = require("../config/gemini");

/**
 * Problem Analysis Agent:
 * Deeply analyzes the problem statement, identifies root friction points,
 * outlines core MVP scope, target users, technical challenges, and risk overview.
 */
async function problemAnalysisAgent(project) {
  const prompt = `You are the Lead Solution Architect at a top-tier hackathon.
Analyze the following project idea:
Title: "${project.title || "Untitled Project"}"
Problem Statement: "${project.problem_statement || "No problem statement provided"}"
Description: "${project.description || "N/A"}"

Provide an in-depth, razor-sharp technical and product breakdown. Formulate:
1. breakdown: Detailed root-cause analysis of why this problem exists and what failure modes current solutions exhibit.
2. targetUsers: Detailed target user personas who experience this pain point.
3. technicalChallenges: Array of 3-4 key technical and architectural hurdles to solve.
4. riskAnalysis: Array of 2-3 critical operational or delivery risks.
5. objectives: 3 to 4 concrete, measurable hackathon MVP milestones.
6. scope: Explicit MVP boundary defining what will be built for the demo vs what is deferred to future work.
7. keyDifferentiators: 3 innovative technical or UX features that make this project stand out to judges.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      breakdown: {
        type: Type.STRING,
        description: "Comprehensive breakdown of root pain points and operational hurdles."
      },
      targetUsers: {
        type: Type.STRING,
        description: "Primary user personas and stakeholder groups affected."
      },
      technicalChallenges: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Key architectural, algorithmic, or infrastructure challenges."
      },
      riskAnalysis: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Critical risks identified during intake."
      },
      objectives: {
        type: Type.STRING,
        description: "Specific SMART technical and business objectives for the MVP."
      },
      scope: {
        type: Type.STRING,
        description: "Clear MVP scope boundaries: core features in-scope vs future enhancements."
      },
      keyDifferentiators: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Innovative differentiators."
      }
    },
    required: ["breakdown", "targetUsers", "technicalChallenges", "objectives", "scope"]
  };

  const fallbackFn = () => ({
    breakdown: `Core Problem Analysis for "${project.title}":\n- Primary Friction: ${project.problem_statement || "Unstructured workflows and manual execution overhead."}\n- Underlying Cause: Lack of automated orchestration, fragmented communication, and siloed task tracking.\n- Impact: High latency, duplicated developer effort, and missed deadlines.`,
    targetUsers: `Hackathon participants, engineering leads, project managers, and product stakeholders collaborating on ${project.title}.`,
    technicalChallenges: [
      "Real-time bidirectional event streaming across distributed client sessions",
      "Dynamic schema-constrained LLM generation and state persistence",
      "Balanced task scheduling across heterogeneous domain specializations"
    ],
    riskAnalysis: [
      "Inference rate limiting under rapid project generation bursts",
      "State synchronization lag between WebSocket channels and PostgreSQL storage"
    ],
    objectives: `1. Build an end-to-end automated platform addressing ${project.title}.\n2. Deliver real-time feedback and state tracking via modern APIs.\n3. Implement a responsive, role-based dashboard for team collaboration.`,
    scope: `In-Scope (MVP):\n- Core data ingestion & automated processing pipeline.\n- Real-time updates & persistent PostgreSQL storage.\n- Role-based user interface for presentation and task execution.\n\nOut-of-Scope (Future):\n- Multi-region replication, native mobile applications, billing integration.`,
    keyDifferentiators: [
      "Real-time event streaming with Socket.IO",
      "Automated multi-agent orchestration via Google Gemini",
      "Relational integrity and role-based access control"
    ]
  });

  return callGeminiStructured({
    prompt,
    schema,
    systemInstruction: "You are a world-class AI hackathon mentor and systems architect. Return concise, technically rigorous JSON.",
    fallbackFn
  });
}

module.exports = { problemAnalysisAgent };
