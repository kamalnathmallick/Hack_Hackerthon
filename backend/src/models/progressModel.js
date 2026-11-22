const pool = require("../config/database");

async function updateProgress({ project_id, member_id, completion_percentage, note }) {
  const query = `
    INSERT INTO progress (project_id, member_id, completion_percentage, note)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  // Actually the prompt says "updateProgress" and "getProjectProgress". 
  // An insert here acts as a progress log. We will insert a new record for each update.
  const values = [project_id, member_id, completion_percentage, note];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function getProjectProgress(project_id) {
  const query = "SELECT * FROM progress WHERE project_id = $1 ORDER BY updated_at DESC";
  const result = await pool.query(query, [project_id]);
  return result.rows;
}

module.exports = {
  updateProgress,
  getProjectProgress
};
