require("dotenv").config();
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_for_unit_tests";

const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

// Mock database and models for self-contained unit tests
const mockProjectsStore = [
  { id: 1, title: "Leader Project", problem_statement: "Problem 1", created_by: 10, status: "GENERATING" },
  { id: 2, title: "Other Project", problem_statement: "Problem 2", created_by: 20, status: "COMPLETED" }
];

jest.mock("../src/config/database", () => ({
  query: jest.fn().mockResolvedValue({ rows: mockProjectsStore }),
  connect: jest.fn().mockResolvedValue({
    query: jest.fn().mockResolvedValue({ rows: [] }),
    release: jest.fn()
  }),
  end: jest.fn().mockResolvedValue()
}));

jest.mock("../src/models/projectModel", () => ({
  createProject: jest.fn(async (data) => ({
    id: 99,
    ...data,
    created_at: new Date()
  })),
  getAllProjects: jest.fn(async () => mockProjectsStore),
  getProjectsForUser: jest.fn(async (userId, role) => {
    return mockProjectsStore.filter(p => p.created_by === userId);
  }),
  getProjectById: jest.fn(async (id) => mockProjectsStore.find(p => p.id === Number(id)) || null),
  updateProject: jest.fn(async (id, updates) => ({ id: Number(id), ...updates })),
  deleteProject: jest.fn(async (id) => ({ id: Number(id) }))
}));

jest.mock("../src/agents/orchestratorAgent", () => ({
  orchestratorAgent: jest.fn().mockResolvedValue({ success: true })
}));

jest.mock("../src/models/userModel", () => ({
  findUserById: jest.fn(async (id) => {
    if (id === 10) return { id: 10, name: "Leader", role: "TEAM_LEADER" };
    if (id === 11) return { id: 11, name: "Member", role: "TEAM_MEMBER" };
    return null;
  })
}));

const projectRoutes = require("../src/routes/projectRoutes");
const app = express();
app.use(express.json());
app.use("/api/projects", projectRoutes);

describe("Projects Multi-Tenancy & Async Pipeline Unit Tests", () => {
  const leaderToken = jwt.sign({ id: 10, role: "TEAM_LEADER" }, process.env.JWT_SECRET);
  const otherToken = jwt.sign({ id: 11, role: "TEAM_MEMBER" }, process.env.JWT_SECRET);

  test("1. POST /api/projects returns immediately with 201 Created and status GENERATING", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${leaderToken}`)
      .send({
        title: "Test Autonomous Pipeline",
        problemStatement: "Manual project intake is slow and uncoordinated."
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.project.status).toBe("GENERATING");
    expect(res.body.project.id).toBe(99);
  });

  test("2. GET /api/projects scopes projects to logged-in user", async () => {
    const res = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${leaderToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.projects)).toBe(true);
    // Leader with id 10 only sees project created_by: 10
    expect(res.body.projects.every(p => p.created_by === 10)).toBe(true);
  });

  test("3. Unauthenticated request to /api/projects returns 401 Unauthorized", async () => {
    const res = await request(app).get("/api/projects");
    expect(res.statusCode).toBe(401);
  });
});
