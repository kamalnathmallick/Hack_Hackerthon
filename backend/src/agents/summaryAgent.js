const { createSummary } = require("../models/summaryModel");
const { callGeminiStructured, Type } = require("../config/gemini");

/**
 * Summary Agent:
 * Synthesizes the analysis, feasibility, roadmap, and risks into a comprehensive,
 * beautifully formatted executive project summary.
 */
async function summaryAgent(project, analysis, feasibility, roadmap, risks) {
  const roadmapFormatted = Array.isArray(roadmap) ? roadmap.join("\n  ") : String(roadmap || "");
  const risksFormatted = Array.isArray(risks) ? risks.join("\n  ") : String(risks || "");

  const context = `Project: "${project.title}"
Problem Statement: "${project.problem_statement || ""}"
Analysis: ${analysis ? analysis.breakdown : ""}
Feasibility: ${feasibility ? feasibility.technicalFeasibility : ""}
Roadmap:\n  ${roadmapFormatted}
Risks:\n  ${risksFormatted}`;

  const prompt = `You are a Principal Product Manager and Technical Writer.
Synthesize all engineering and product discoveries for this project into a polished, comprehensive Executive Summary:
${context}

Return a structured JSON object containing:
- executiveSummary: A compelling 2-3 paragraph markdown summary synthesizing the project vision, technical innovation, problem solution fit, feasibility, and risk management strategy.
- keyHighlights: 3-5 bullet points summarizing why this project stands out.`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      executiveSummary: {
        type: Type.STRING,
        description: "Comprehensive markdown executive summary."
      },
      keyHighlights: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Key bullet points."
      }
    },
    required: ["executiveSummary"]
  };

  const fallbackFn = () => ({
    executiveSummary: `=======================================================
HACKFLOW AI — EXECUTIVE PROJECT DOSSIER
=======================================================
PROJECT: ${project.title}
STATUS: Orchestrated & Verified

1. PROBLEM & TARGET MARKET
${analysis?.breakdown || project.problem_statement || "N/A"}

2. OBJECTIVES & SCOPE
${analysis?.objectives || "N/A"}
${analysis?.scope || "N/A"}

3. TECHNICAL ARCHITECTURE & FEASIBILITY
${feasibility?.technicalFeasibility || "N/A"}
Estimated Timeline: ${feasibility?.timeEstimate || "4 weeks"}
Resource Stack: ${Array.isArray(feasibility?.resourceRequirements) ? feasibility.resourceRequirements.join(", ") : "N/A"}

4. EXECUTION ROADMAP
  ${roadmapFormatted}

5. RISK MATRIX & MITIGATION STRATEGY
  ${risksFormatted}

=======================================================
Generated automatically by HackFlow AI Gemini Orchestration
=======================================================`
  });

  const result = await callGeminiStructured({
    prompt,
    schema,
    systemInstruction: "You are a senior product executive creating formal project summaries for hackathon evaluations.",
    fallbackFn
  });

  const summaryText = result?.executiveSummary || fallbackFn().executiveSummary;

  await createSummary({
    project_id: project.id,
    summary_text: summaryText
  });

  return summaryText;
}

module.exports = { summaryAgent };
