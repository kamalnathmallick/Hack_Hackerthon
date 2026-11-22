const { createTask, getTasksByProject, updateTaskStatus, deleteTask } = require("../models/taskModel");

async function createTaskHandler(req, res) {
  try {
    const task = await createTask(req.body);
    res.status(201).json({ success: true, task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function getTasksHandler(req, res) {
  try {
    const tasks = await getTasksByProject(req.params.projectId);
    res.json({ success: true, tasks, data: tasks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function updateTaskHandler(req, res) {
  try {
    const task = await updateTaskStatus(req.params.id, req.body.status);
    res.json({ success: true, task, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

async function deleteTaskHandler(req, res) {
  try {
    const task = await deleteTask(req.params.id);
    res.json({ success: true, task, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

module.exports = {
  createTaskHandler,
  getTasksHandler,
  updateTaskHandler,
  deleteTaskHandler
};
