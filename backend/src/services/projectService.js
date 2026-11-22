const { 
  createProject, 
  getAllProjects, 
  getProjectsForUser, 
  getProjectById, 
  updateProject, 
  deleteProject 
} = require("../models/projectModel");
const { orchestratorAgent } = require("../agents/orchestratorAgent");

/**
 * Non-blocking project creation:
 * 1. Saves project immediately with status 'GENERATING'
 * 2. Returns 201 Created with project details instantly
 * 3. Kicks off orchestratorAgent asynchronously in the background, streaming events over Socket.IO
 */
async function createProjectHandler(req, res) {
  try {
    const userId = req.user ? req.user.id : 1;
    const { title, problemStatement, problem_statement, description } = req.body;
    const finalProblem = problemStatement || problem_statement || "";

    const project = await createProject({
      title,
      problem_statement: finalProblem,
      description: description || "",
      created_by: userId,
      status: "GENERATING"
    });

    console.log(`[Project] Project #${project.id} created with status 'GENERATING' by user #${userId}`);

    // Immediately respond so client is never blocked
    res.status(201).json({ 
      success: true, 
      message: "Project created successfully. AI agent orchestration started.",
      project, 
      data: project 
    });

    // Run AI pipeline asynchronously in the background
    const io = req.app ? req.app.get("io") : null;
    setImmediate(async () => {
      try {
        console.log(`[Background Pipeline] Commencing orchestratorAgent for project #${project.id}`);
        await orchestratorAgent(project, io);
        await updateProject(project.id, { status: "COMPLETED" });
        console.log(`[Background Pipeline] Project #${project.id} marked as COMPLETED`);
      } catch (error) {
        console.error(`[Background Pipeline] Error for project #${project.id}:`, error);
        await updateProject(project.id, { status: "FAILED" });
        if (io) {
          io.to(`project:${project.id}`).emit("agent:error", {
            projectId: project.id,
            error: error.message || "Pipeline execution failed"
          });
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getAllProjectsHandler(req, res) {
  try {
    const userId = req.user ? req.user.id : null;
    const role = req.user ? req.user.role : null;

    let projects;
    if (userId) {
      projects = await getProjectsForUser(userId, role);
    } else {
      projects = await getAllProjects();
    }

    res.json({ success: true, projects, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getProjectByIdHandler(req, res) {
  try {
    const project = await getProjectById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Project not found" });
    res.json({ success: true, project, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateProjectHandler(req, res) {
  try {
    const project = await updateProject(req.params.id, req.body);
    res.json({ success: true, project, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteProjectHandler(req, res) {
  try {
    const project = await deleteProject(req.params.id);
    res.json({ success: true, project, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

// Ensure the raw service logic is exportable for automation routes
const projectService = {
  createProject: async (data) => {
    const project = await createProject(data);
    try {
      await orchestratorAgent(project);
    } catch (error) {
      console.error("Automation failed:", error);
    }
    return project;
  }
};

module.exports = {
  createProjectHandler,
  getAllProjectsHandler,
  getProjectByIdHandler,
  updateProjectHandler,
  deleteProjectHandler,
  projectService
};
