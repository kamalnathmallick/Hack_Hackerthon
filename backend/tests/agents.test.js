require("dotenv").config();

// Mock models for agent tests
jest.mock("../src/models/taskModel", () => ({
  createTask: jest.fn(async (task) => ({ id: Math.floor(Math.random() * 1000), ...task }))
}));

jest.mock("../src/models/userModel", () => ({
  findMembers: jest.fn(async () => [
    { id: 101, name: "Alice Frontend", email: "alice@member.com", role: "TEAM_MEMBER", domain: "Frontend" },
    { id: 102, name: "Bob Backend", email: "bob@member.com", role: "TEAM_MEMBER", domain: "Backend" },
    { id: 103, name: "Charlie AI", email: "charlie@member.com", role: "TEAM_MEMBER", domain: "AI" }
  ])
}));

jest.mock("../src/models/pptModel", () => ({
  createPPT: jest.fn(async (ppt) => ({ id: Math.floor(Math.random() * 1000), ...ppt }))
}));

const { problemAnalysisAgent } = require("../src/agents/problemAnalysisAgent");
const { feasibilityAgent } = require("../src/agents/feasibilityAgent");
const { roadmapAgent } = require("../src/agents/roadmapAgent");
const { riskAgent } = require("../src/agents/riskAgent");
const { taskAgent } = require("../src/agents/taskAgent");
const { pptAgent } = require("../src/agents/pptAgent");

describe("Gemini AI Multi-Agent Pipeline Unit Tests", () => {
  const mockProject = {
    id: 101,
    title: "EcoTrack: Smart Carbon Accounting",
    problem_statement: "Enterprises struggle to track Scope 3 supply-chain carbon emissions automatically.",
    description: "An automated real-time ingestion platform connecting ERP systems to calculate footprint.",
    created_by: 1
  };

  test("ProblemAnalysisAgent generates structured breakdown, targetUsers, technicalChallenges, and scope", async () => {
    const analysis = await problemAnalysisAgent(mockProject);
    expect(analysis).toBeDefined();
    expect(analysis.breakdown).toBeDefined();
    expect(typeof analysis.breakdown).toBe("string");
    expect(analysis.targetUsers).toBeDefined();
    expect(Array.isArray(analysis.technicalChallenges)).toBe(true);
    expect(analysis.objectives).toBeDefined();
    expect(analysis.scope).toBeDefined();
  });

  test("FeasibilityAgent evaluates stack, resources, and time estimates", async () => {
    const feasibility = await feasibilityAgent(mockProject);
    expect(feasibility).toBeDefined();
    expect(feasibility.timeEstimate).toBeDefined();
    expect(Array.isArray(feasibility.resourceRequirements)).toBe(true);
    expect(feasibility.resourceRequirements.length).toBeGreaterThan(0);
    expect(feasibility.technicalFeasibility).toBeDefined();
  });

  test("RoadmapAgent generates ordered phases with technical milestones", async () => {
    const roadmap = await roadmapAgent(mockProject);
    expect(Array.isArray(roadmap)).toBe(true);
    expect(roadmap.length).toBeGreaterThanOrEqual(4);
    expect(roadmap[0]).toContain("Phase");
  });

  test("RiskAgent identifies risks with severity ratings and mitigations", async () => {
    const risks = await riskAgent(mockProject);
    expect(Array.isArray(risks)).toBe(true);
    expect(risks.length).toBeGreaterThanOrEqual(3);
    expect(risks[0]).toMatch(/\[(High|Medium|Low)\]/);
    expect(risks[0]).toContain("Mitigation");
  });

  test("TaskAgent generates tailored technical tasks with estimated effort and balanced member assignment", async () => {
    const tasks = await taskAgent(mockProject);
    expect(Array.isArray(tasks)).toBe(true);
    expect(tasks.length).toBeGreaterThanOrEqual(5);

    const firstTask = tasks[0];
    expect(firstTask.title).toBeDefined();
    expect(firstTask.description).toBeDefined();
    expect(firstTask.domain).toBeDefined();
    expect(firstTask.priority).toBeDefined();
    expect(firstTask.estimatedEffort).toBeDefined();
    // Confirm assignment is populated from mock members
    expect([101, 102, 103]).toContain(firstTask.assigned_to);
  });

  test("PPTAgent generates a structured 7-slide pitch deck with title, bullets, and speakerNotes", async () => {
    const result = await pptAgent(mockProject, "Executive summary text here");
    expect(result).toBeDefined();
    expect(Array.isArray(result.slides)).toBe(true);
    expect(result.slides.length).toBe(7);

    const slide1 = result.slides[0];
    expect(slide1.slideNumber).toBe(1);
    expect(slide1.title).toBeDefined();
    expect(Array.isArray(slide1.bullets)).toBe(true);
    expect(slide1.bullets.length).toBeGreaterThanOrEqual(3);
    expect(slide1.speakerNotes).toBeDefined();
    expect(slide1.speakerNotes.length).toBeGreaterThan(10);

    // Verify stored JSON
    const parsed = JSON.parse(result.pptText);
    expect(parsed.slides).toBeDefined();
    expect(parsed.slides.length).toBe(7);
  });
});
