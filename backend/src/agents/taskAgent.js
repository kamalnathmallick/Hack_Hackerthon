const { createTask } = require("../models/taskModel");
const { findMembers } = require("../models/userModel");
const { callGeminiStructured, Type } = require("../config/gemini");

/**
 * Task Agent:
 * Decomposes project requirements into granular technical tasks with priority,
 * estimated effort, required skills/domain, and intelligently assigns them to
 * actual project team members based on domain affinity and balanced load.
 * NEVER falls back to arbitrary members[0].
 */
async function taskAgent(project, analysis = null, feasibility = null) {
  const members = await findMembers();

  const memberContext = members && members.length > 0
    ? members.map(m => `- ${m.name} (ID: ${m.id}, Domain: ${m.domain || "Generalist"})`).join("\n")
    : "No registered team members yet.";

  const context = `Project: "${project.title}"
Problem Statement: "${project.problem_statement || ""}"
${analysis ? `Breakdown: ${analysis.breakdown}\nObjectives: ${analysis.objectives}` : ""}
${feasibility ? `Recommended Tech Stack: ${(feasibility.recommendedStack || []).join(", ")}` : ""}
Available Team Members:\n${memberContext}`;

  const prompt = `You are a Technical Lead and Scrum Master.
Break down this project into 5 to 7 concrete, high-impact engineering tasks:
${context}

Generate granular technical tasks across domains (Frontend, Backend, AI, Database, DevOps, Testing).
Each task must contain:
- title: Actionable, technical task title (e.g. "Implement Real-time WebSocket Gateway for Live Agent Events", "Develop Responsive Pitch Deck Viewer in Next.js").
- description: Concise technical description detailing implementation requirements and acceptance criteria.
- domain: One of "Frontend", "Backend", "AI", "Database", "DevOps", "Testing".
- priority: "High", "Medium", or "Low".
- estimatedEffort: Estimated implementation time (e.g., "4 hours", "1 day", "2 days").
- requiredSkills: Array of 2-3 specific technologies or skills (e.g. ["Next.js", "TailwindCSS"]).`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      tasks: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            domain: { 
              type: Type.STRING,
              enum: ["Frontend", "Backend", "AI", "Database", "DevOps", "Testing"]
            },
            priority: {
              type: Type.STRING,
              enum: ["High", "Medium", "Low"]
            },
            estimatedEffort: {
              type: Type.STRING,
              description: "Estimated effort (e.g. '4 hours', '1 day')"
            },
            requiredSkills: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["title", "description", "domain", "priority", "estimatedEffort"]
        },
        description: "List of decomposed engineering tasks."
      }
    },
    required: ["tasks"]
  };

  const fallbackFn = () => ({
    tasks: [
      {
        title: `Design & Implement Responsive UI Dashboard for ${project.title}`,
        description: `Create Next.js interface with TailwindCSS, supporting live project updates, task boards, and presentation deck viewers.`,
        domain: "Frontend",
        priority: "High",
        estimatedEffort: "1 day",
        requiredSkills: ["Next.js", "React", "TailwindCSS"]
      },
      {
        title: `Architect REST APIs & Real-Time Event Pipeline`,
        description: `Build Express backend endpoints and Socket.IO rooms to stream agent progress and project states.`,
        domain: "Backend",
        priority: "High",
        estimatedEffort: "1 day",
        requiredSkills: ["Node.js", "Express", "Socket.IO"]
      },
      {
        title: `Integrate Google Gemini Multi-Agent System`,
        description: `Connect @google/genai SDK with structured output JSON schemas for problem analysis, risk evaluation, and slide generation.`,
        domain: "AI",
        priority: "High",
        estimatedEffort: "6 hours",
        requiredSkills: ["Google Gemini API", "@google/genai", "Prompt Engineering"]
      },
      {
        title: `Design PostgreSQL Relational Schema with Foreign Keys`,
        description: `Create normalized tables for projects, tasks, workflows, summaries, and presentations with cascading deletes.`,
        domain: "Database",
        priority: "Medium",
        estimatedEffort: "4 hours",
        requiredSkills: ["PostgreSQL", "SQL Modeling", "pg"]
      },
      {
        title: `Implement Role-Based Access Control & JWT Security`,
        description: `Secure auth routes, enforce strict role checking (TEAM_LEADER vs TEAM_MEMBER), and eliminate plain-text credentials.`,
        domain: "Backend",
        priority: "High",
        estimatedEffort: "4 hours",
        requiredSkills: ["JWT", "bcryptjs", "RBAC"]
      },
      {
        title: `Automate PPTX Deck Export & Presentation Engine`,
        description: `Generate downloadable .pptx presentations with structured slide layouts using pptxgenjs.`,
        domain: "Frontend",
        priority: "Medium",
        estimatedEffort: "6 hours",
        requiredSkills: ["pptxgenjs", "TypeScript"]
      },
      {
        title: `End-to-End System Testing & Performance Hardening`,
        description: `Author Jest test suites covering authentication, project workflows, and edge-case handling.`,
        domain: "Testing",
        priority: "Medium",
        estimatedEffort: "4 hours",
        requiredSkills: ["Jest", "Supertest"]
      }
    ]
  });

  const result = await callGeminiStructured({
    prompt,
    schema,
    systemInstruction: "You are an elite agile engineering lead. Create realistic, technically rigorous developer tasks with accurate effort estimates.",
    fallbackFn
  });

  const tasksList = Array.isArray(result.tasks) && result.tasks.length > 0 ? result.tasks : fallbackFn().tasks;

  // Domain matching map helper
  const domainKeywords = {
    Frontend: ["frontend", "ui", "ux", "web", "react", "next", "design"],
    Backend: ["backend", "api", "node", "express", "server", "microservice"],
    AI: ["ai", "ml", "machine learning", "nlp", "llm", "data science"],
    Database: ["database", "sql", "postgres", "db", "data"],
    DevOps: ["devops", "cloud", "infra", "docker", "ci/cd", "deployment"],
    Testing: ["testing", "qa", "quality", "test", "automation"]
  };

  // Track task load per member ID to balance assignment
  const memberLoad = new Map();
  if (Array.isArray(members)) {
    members.forEach(m => memberLoad.set(m.id, 0));
  }

  const createdTasks = [];

  for (const t of tasksList) {
    let assignedUserId = null;

    if (members && members.length > 0) {
      const taskDomainKey = Object.keys(domainKeywords).find(
        k => k.toLowerCase() === (t.domain || "").toLowerCase()
      ) || t.domain;

      const keywords = domainKeywords[taskDomainKey] || [taskDomainKey.toLowerCase()];

      // Find all members whose domain matches any of the keywords
      const matchedMembers = members.filter(m => {
        const userDomain = (m.domain || "").toLowerCase();
        return keywords.some(kw => userDomain.includes(kw));
      });

      if (matchedMembers.length > 0) {
        // Pick the matching member with lowest current assigned task load
        matchedMembers.sort((a, b) => (memberLoad.get(a.id) || 0) - (memberLoad.get(b.id) || 0));
        assignedUserId = matchedMembers[0].id;
      } else {
        // If no domain match, balance load across generalist members
        const sortedMembers = [...members].sort(
          (a, b) => (memberLoad.get(a.id) || 0) - (memberLoad.get(b.id) || 0)
        );
        assignedUserId = sortedMembers[0].id;
      }

      // Increment load counter
      if (assignedUserId) {
        memberLoad.set(assignedUserId, (memberLoad.get(assignedUserId) || 0) + 1);
      }
    } else if (project.created_by) {
      // If no team members exist in the system, assign to project creator
      assignedUserId = project.created_by;
    }

    const taskTitle = t.title || "Task Implementation";
    const taskDesc = `${t.description || ""}${t.estimatedEffort ? `\n[Estimated Effort: ${t.estimatedEffort}]` : ""}${t.requiredSkills && t.requiredSkills.length ? `\n[Skills: ${t.requiredSkills.join(", ")}]` : ""}`;

    const created = await createTask({
      project_id: project.id,
      assigned_to: assignedUserId,
      title: taskTitle,
      description: taskDesc.trim(),
      status: "Assigned",
      priority: t.priority || "Medium"
    });

    createdTasks.push({
      ...created,
      domain: t.domain,
      estimatedEffort: t.estimatedEffort,
      requiredSkills: t.requiredSkills
    });
  }

  return createdTasks;
}

module.exports = { taskAgent };
