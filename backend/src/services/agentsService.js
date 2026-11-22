const { generateWorkflowFromIdea } = require("./workflowService");

function orchestratorAgent(project) {
  const base = generateWorkflowFromIdea(project);
  const domainBuckets = ["Frontend", "Backend", "AI", "Database", "Testing"];

  const taskSuggestions = base.modules.map((module, idx) => ({
    title: `${module} Implementation`,
    description: `Build and validate ${module.toLowerCase()} for project "${project.title}".`,
    instructions: `Deliver code, tests, and integration notes for ${module}.`,
    priority: idx < 2 ? "High" : "Medium",
    domain: domainBuckets[idx % domainBuckets.length]
  }));

  const roadmap = [
    "Week 1: Problem intake, analysis, and feasibility validation.",
    "Week 2: MVP scope, feature selection, and architecture lock.",
    "Week 3: Module implementation and iterative testing.",
    "Week 4: Risk closure, judge simulation, final summary, and PPT."
  ];

  const implementationSteps = [
    "Initialize repository and environments.",
    "Implement core modules in parallel by domain owners.",
    "Integrate APIs, workflows, and real-time updates.",
    "Run testing, risk review, and final presentation prep."
  ];

  return {
    agents: {
      orchestrator: "completed",
      ideaIntake: "completed",
      problemAnalysis: "completed",
      feasibility: "completed",
      roadmap: "completed",
      workflowGeneration: "completed",
      taskAssignment: "completed",
      riskDetection: "completed",
      summary: "completed",
      pptGeneration: "completed"
    },
    ...base,
    roadmap,
    implementationSteps,
    taskSuggestions
  };
}

module.exports = {
  orchestratorAgent
};
