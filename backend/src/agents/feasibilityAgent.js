const { callGeminiStructured, Type } = require("../config/gemini");

/**
 * Feasibility Agent:
 * Evaluates architectural viability, stack selection, implementation timeline,
 * and technical bottlenecks based on the problem and analysis.
 */
async function feasibilityAgent(project, analysis = null) {
  const analysisContext = analysis 
    ? `Problem Breakdown: ${analysis.breakdown}\nObjectives: ${analysis.objectives}\nScope: ${analysis.scope}`
    : `Problem: ${project.problem_statement}`;

  const prompt = `You are a Principal Software Architect evaluating the feasibility of a hackathon engineering project:
Project Title: "${project.title}"
${analysisContext}

Assess the technical feasibility:
1. timeEstimate: Realistic timeline split into Hackathon MVP (hours) vs Production Release (weeks).
2. resourceRequirements: 4-5 specific engineering roles and domains needed.
3. technicalFeasibility: Deep dive evaluating technical complexity, API dependencies, throughput, and state management.
4. recommendedStack: Modern, high-performance tech stack tailored to this problem.
5. criticalBlockers: 2-3 potential engineering roadblocks to watch out for.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      timeEstimate: {
        type: Type.STRING,
        description: "Realistic timeline for MVP and production."
      },
      resourceRequirements: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Specialized roles needed."
      },
      technicalFeasibility: {
        type: Type.STRING,
        description: "Technical viability assessment, architecture notes, and complexity analysis."
      },
      recommendedStack: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Recommended libraries, frameworks, and databases."
      },
      criticalBlockers: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Key technical bottlenecks or dependencies."
      }
    },
    required: ["timeEstimate", "resourceRequirements", "technicalFeasibility"]
  };

  const fallbackFn = () => ({
    timeEstimate: "36 hours for Hackathon MVP | 3-4 weeks for Production v1.0",
    resourceRequirements: [
      "Frontend Engineer (Next.js / TailwindCSS)",
      "Backend Engineer (Node.js / Express / Socket.IO)",
      "AI / LLM Integration Engineer (Google Gemini API)",
      "Database Engineer (PostgreSQL / Relational Modeling)",
      "QA & Systems Tester"
    ],
    technicalFeasibility: `High technical feasibility for "${project.title}". Architecture leverages decoupled microservices or modular monolith with Node.js and PostgreSQL. Real-time updates delivered via WebSockets and AI inference offloaded to Google Gemini API with structured JSON output.`,
    recommendedStack: [
      "Next.js / React for dynamic UI",
      "Node.js & Express for REST API",
      "PostgreSQL with Connection Pooling",
      "@google/genai SDK (Gemini 3.8 Flash)",
      "Socket.IO for bi-directional streaming"
    ],
    criticalBlockers: [
      "LLM latency or rate-limiting during batch generations",
      "Relational integrity and concurrency during multi-agent updates"
    ]
  });

  return callGeminiStructured({
    prompt,
    schema,
    systemInstruction: "You are a senior technical director evaluating project architecture and feasibility.",
    fallbackFn
  });
}

module.exports = { feasibilityAgent };
