const { callGeminiStructured, Type } = require("../config/gemini");

/**
 * Risk Agent:
 * Analyzes architectural vulnerabilities, dependency risks, and operational hurdles,
 * generating actionable risk statements with concrete mitigation strategies.
 */
async function riskAgent(project, analysis = null, feasibility = null) {
  const context = `Project: "${project.title}"
Problem Statement: "${project.problem_statement || ""}"
${analysis ? `Scope: ${analysis.scope}` : ""}
${feasibility ? `Feasibility: ${feasibility.technicalFeasibility}` : ""}`;

  const prompt = `You are a Cybersecurity and Technical Risk Assessor for a fast-paced hackathon project:
${context}

Identify 4 to 5 critical technical, architectural, or delivery risks specific to this project.
For each risk, provide:
- risk: The specific vulnerability or bottleneck.
- severity: "High", "Medium", or "Low".
- mitigation: Concrete engineering action to eliminate or minimize the risk.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      risks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            risk: { type: Type.STRING },
            severity: { 
              type: Type.STRING,
              enum: ["High", "Medium", "Low"]
            },
            mitigation: { type: Type.STRING }
          },
          required: ["risk", "severity", "mitigation"]
        },
        description: "List of identified risks with severities and mitigations."
      }
    },
    required: ["risks"]
  };

  const fallbackFn = () => ({
    risks: [
      {
        risk: "API Rate Limits & Inference Latency",
        severity: "High",
        mitigation: "Implement response caching, graceful fallbacks, and asynchronous background worker processing."
      },
      {
        risk: "Database Orphaned Records & Inconsistent State",
        severity: "Medium",
        mitigation: "Enforce PostgreSQL foreign key constraints with ON DELETE CASCADE across all child tables."
      },
      {
        risk: "Authentication & Role Verification Flaws",
        severity: "High",
        mitigation: "Strictly validate JWT payload roles, enforce route-level RBAC guards, and use environment-secured secrets."
      },
      {
        risk: "WebSocket Connection Drops & Missed Events",
        severity: "Medium",
        mitigation: "Implement automatic socket reconnection with exponential backoff and persistent polling fallbacks."
      },
      {
        risk: "Scope Creep & Tight Hackathon Timeline",
        severity: "Medium",
        mitigation: "Strictly prioritize core MVP user journey and defer non-essential features to post-hackathon roadmap."
      }
    ]
  });

  const result = await callGeminiStructured({
    prompt,
    schema,
    systemInstruction: "You are a senior reliability and security engineer assessing hackathon software risks.",
    fallbackFn
  });

  const riskList = Array.isArray(result.risks) && result.risks.length > 0 ? result.risks : fallbackFn().risks;

  // Format cleanly so both array consumers and string joiners work seamlessly
  return riskList.map(r => `[${r.severity}] ${r.risk} — Mitigation: ${r.mitigation}`);
}

module.exports = { riskAgent };
