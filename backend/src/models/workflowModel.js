const pool = require("../config/database");

async function createWorkflowStep({ project_id, step_name, step_description }) {
  const query = `
    INSERT INTO workflow (project_id, step_name, step_description)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [project_id, step_name, step_description];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function getWorkflowByProject(project_id) {
  const query = "SELECT * FROM workflow WHERE project_id = $1 ORDER BY created_at ASC";
  const result = await pool.query(query, [project_id]);
  return result.rows;
}

module.exports = {
  createWorkflowStep,
  getWorkflowByProject
};
