const { createTask, getTaskById, getTasksForUser, getTasksByProjectId, updateTask } = require("../models/taskModel");
const { projectExists } = require("../models/projectModel");
const { findUserById, findUserByEmail } = require("../models/userModel");
const { sendError, sendSuccess } = require("../utils/http");
const db = require("../config/database");

function createTaskHandler(req, res) {
  const { projectId, assignedTo, memberEmail, domain, title, description, instructions, status, priority } = req.validated.body;
  if (!projectExists(projectId)) return sendError(res, 404, "Project not found.");

  let targetMemberId = assignedTo;
  if (!targetMemberId && memberEmail) {
    const found = findUserByEmail(memberEmail);
    if (found) targetMemberId = found.id;
  }

  if (!targetMemberId) {
    return sendError(res, 400, "assignedTo or memberEmail is required.");
  }

  const member = findUserById(targetMemberId);
  if (!member || member.role !== "TEAM_MEMBER") {
    return sendError(res, 400, "Task can only be assigned to a Team Member.");
  }

  const resolvedTitle = title || `${domain || "General"} Task`;
  const task = createTask({
    projectId,
    assignedTo: targetMemberId,
    title: resolvedTitle,
    description,
    instructions: instructions || `Domain focus: ${domain || "General"}`,
    status,
    priority
  });

  req.app.get("io").emit("task:assigned", { taskId: task.id, assignedTo: targetMemberId, projectId });
  return sendSuccess(res, task, "Task assigned.");
}

function getTasksHandler(req, res) {
  const tasks = getTasksForUser(req.user);
  return sendSuccess(res, tasks, "Tasks fetched.");
}

function getTaskByIdHandler(req, res) {
  const id = Number(req.params.id);
  const task = getTaskById(id);
  if (!task) return sendError(res, 404, "Task not found.");

  if (req.user.role === "TEAM_MEMBER" && task.assigned_to !== req.user.id) {
    return sendError(res, 403, "Forbidden task access.");
  }

  return sendSuccess(res, task, "Task fetched.");
}

function updateTaskHandler(req, res) {
  const id = Number(req.params.id);
  const existing = getTaskById(id);
  if (!existing) return sendError(res, 404, "Task not found.");

  if (req.user.role === "TEAM_MEMBER" && existing.assigned_to !== req.user.id) {
    return sendError(res, 403, "You can update only your assigned tasks.");
  }

  const task = updateTask(id, req.validated.body);
  recomputeProjectProgress(existing.project_id);
  req.app.get("io").emit("task:updated", { taskId: id, projectId: existing.project_id, task });
  return sendSuccess(res, task, "Task updated.");
}

function getTasksByProjectHandler(req, res) {
  const projectId = Number(req.params.projectId);
  if (!projectExists(projectId)) return sendError(res, 404, "Project not found.");

  let tasks = getTasksByProjectId(projectId);
  if (req.user.role === "TEAM_MEMBER") {
    tasks = tasks.filter((task) => task.assigned_to === req.user.id);
  }
  return sendSuccess(res, tasks, "Project tasks fetched.");
}

function recomputeProjectProgress(projectId) {
  const stats = db
    .prepare(
      `SELECT COUNT(*) AS total, SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) AS completed
       FROM tasks WHERE project_id = ?`
    )
    .get(projectId);

  const total = stats.total || 0;
  const completed = stats.completed || 0;
  const progressValue = total === 0 ? 0 : Math.round((completed / total) * 100);
  const note = `Auto-updated from task completion (${completed}/${total})`;

  const existing = db
    .prepare("SELECT id FROM progress WHERE project_id = ?")
    .get(projectId);
  if (existing) {
    db.prepare(
      `UPDATE progress
       SET progress_value = ?, note = ?, updated_at = CURRENT_TIMESTAMP
       WHERE project_id = ?`
    ).run(progressValue, note, projectId);
  } else {
    db.prepare(
      `INSERT INTO progress (project_id, progress_value, note)
       VALUES (?, ?, ?)`
    ).run(projectId, progressValue, note);
  }
}

module.exports = {
  createTaskHandler,
  getTasksHandler,
  getTaskByIdHandler,
  updateTaskHandler,
  getTasksByProjectHandler
};
