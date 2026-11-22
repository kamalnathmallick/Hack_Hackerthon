const pool = require("../config/database");

async function createTask({ project_id, assigned_to, title, description, status, priority }) {
  const query = `
    INSERT INTO tasks (project_id, assigned_to, title, description, status, priority)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
  const values = [
    project_id, 
    assigned_to, 
    title, 
    description || "", 
    status || "Assigned", 
    priority || "Medium"
  ];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function getTasksByProject(project_id) {
  const query = "SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at ASC";
  const result = await pool.query(query, [project_id]);
  return result.rows;
}

async function updateTaskStatus(id, status) {
  const query = `
    UPDATE tasks 
    SET status = $1
    WHERE id = $2
    RETURNING *;
  `;
  const result = await pool.query(query, [status, id]);
  return result.rows[0];
}

async function deleteTask(id) {
  const query = "DELETE FROM tasks WHERE id = $1 RETURNING *";
  const result = await pool.query(query, [id]);
  return result.rows[0];
}

module.exports = {
  createTask,
  getTasksByProject,
  updateTaskStatus,
  deleteTask
};
