require("dotenv").config();

if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET environment variable is missing.");
  process.exit(1);
}

const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
const express = require("express");
const { Server } = require("socket.io");
const { initDatabase } = require("./config/initDatabase");
const { login } = require("./controllers/authController");
// Removed old getProgress imports
const { validate } = require("./middleware/validateMiddleware");
const { authMiddleware } = require("./middleware/authMiddleware");
const { loginSchema } = require("./utils/validators");
const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const testAutomationRoute = require("./routes/testAutomationRoute");
const taskRoutes = require("./routes/taskRoutes");
const workflowRoutes = require("./routes/workflowRoutes");
const progressRoutes = require("./routes/progressRoutes");
const summaryRoutes = require("./routes/summaryRoutes");
const pptRoutes = require("./routes/pptRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const healthRoutes = require("./routes/healthRoutes");
const userRoutes = require("./routes/userRoutes");
const { notFoundMiddleware } = require("./middleware/notFoundMiddleware");
const { errorMiddleware } = require("./middleware/errorMiddleware");

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://localhost:3001"
].filter(Boolean);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT"]
  }
});

app.set("io", io);

app.use(
  cors({
    origin: allowedOrigins
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));

io.on("connection", (socket) => {
  socket.on("join:project", (projectId) => {
    socket.join(`project:${projectId}`);
  });
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "HackFlow AI API",
    data: {
      roles: ["TEAM_LEADER", "TEAM_MEMBER"]
    }
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    database: "connected"
  });
});
app.use("/api/health", healthRoutes);
app.post("/api/login", validate(loginSchema), login);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/test", testAutomationRoute);
app.use("/api/tasks", taskRoutes);
app.use("/api/workflow", workflowRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/ppt", pptRoutes);
app.use("/api/users", userRoutes);
app.use("/api", dashboardRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

async function bootstrap() {
  try {
    await initDatabase();
    const port = Number(process.env.PORT || 5000);
    server.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log("Connected to PostgreSQL");
      console.log("Automation system ready");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

bootstrap();
