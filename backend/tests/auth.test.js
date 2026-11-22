require("dotenv").config();
process.env.JWT_SECRET = process.env.JWT_SECRET || "test_jwt_secret_for_unit_tests";

const request = require("supertest");
const express = require("express");

// Mock userModel and database to enable self-contained unit testing
const mockUsersStore = new Map();

jest.mock("../src/config/database", () => ({
  query: jest.fn().mockResolvedValue({ rows: [] }),
  end: jest.fn().mockResolvedValue()
}));

jest.mock("../src/config/initDatabase", () => ({
  initDatabase: jest.fn().mockResolvedValue()
}));

jest.mock("../src/models/userModel", () => ({
  createUser: jest.fn(async ({ name, email, password, role, domain }) => {
    const user = {
      id: mockUsersStore.size + 1,
      name,
      email,
      password,
      role: role ? role.toUpperCase() : "TEAM_MEMBER",
      domain,
      created_at: new Date()
    };
    mockUsersStore.set(email, user);
    mockUsersStore.set(user.id, user);
    return user;
  }),
  findUserByEmail: jest.fn(async (email) => {
    return mockUsersStore.get(email) || null;
  }),
  findUserById: jest.fn(async (id) => {
    return mockUsersStore.get(Number(id)) || null;
  }),
  findMembers: jest.fn(async () => {
    const uniqueUsers = Array.from(new Set(mockUsersStore.values()));
    return uniqueUsers.filter(u => u.role === "TEAM_MEMBER" || u.role === "MEMBER");
  }),
  updateUserPassword: jest.fn(async (email, hashedPassword) => {
    const user = mockUsersStore.get(email);
    if (user) {
      user.password = hashedPassword;
      mockUsersStore.set(email, user);
      mockUsersStore.set(user.id, user);
    }
  }),
  updateUserProfile: jest.fn(async (email, name, domain) => {
    const user = mockUsersStore.get(email);
    if (user) {
      user.name = name;
      user.domain = domain;
    }
    return user;
  })
}));

const authRoutes = require("../src/routes/authRoutes");

const app = express();
app.use(express.json());
app.use("/api/auth", authRoutes);

describe("Authentication Flow Tests", () => {
  let userToken = "";
  let userEmail = `user_${Date.now()}@test.com`;

  test("1. Register user - expect 201 Created with normalized uppercase role", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: userEmail,
        password: "TestPassword123!",
        role: "TEAM_LEADER",
        domain: "Testing"
      });
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.role).toBe("TEAM_LEADER");
  });

  test("2. Login user - expect 200 OK and JWT token", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: userEmail,
        password: "TestPassword123!"
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe("TEAM_LEADER");
    userToken = res.body.token;
  });

  test("3. Invalid password - expect 401 Unauthorized", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({
        email: userEmail,
        password: "WrongPassword"
      });
    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("4. Forgot password does not leak resetToken in body", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: userEmail });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.resetToken).toBeUndefined();
  });

  test("5. Reset password with verification - expect 200 OK", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({
        email: userEmail,
        currentPassword: "TestPassword123!",
        newPassword: "NewTestPassword123!"
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("6. Reset password without verification fails - expect 400 Bad Request", async () => {
    const res = await request(app)
      .post("/api/auth/reset-password")
      .send({
        email: userEmail,
        newPassword: "HackedPassword123!"
      });
    expect(res.statusCode).toBe(400);
    expect(res.body.success).toBe(false);
  });

  test("7. Change password - expect 200 OK", async () => {
    const res = await request(app)
      .post("/api/auth/change-password")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        email: userEmail,
        currentPassword: "NewTestPassword123!",
        newPassword: "AnotherNewPassword123!"
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("8. Protected members list requires TEAM_LEADER", async () => {
    const res = await request(app)
      .get("/api/auth/members")
      .set("Authorization", `Bearer ${userToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("9. Token validation - expect 401 if missing", async () => {
    const res = await request(app)
      .post("/api/auth/change-password")
      .send({
        email: userEmail,
        currentPassword: "AnotherNewPassword123!",
        newPassword: "OneMoreTime!"
      });
    expect(res.statusCode).toBe(401);
  });
});
