const pool = require("../config/database");

async function createSummary({ project_id, summary_text }) {
  const query = `
    INSERT INTO summary (project_id, summary_text)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const values = [project_id, summary_text];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function getSummaryByProject(project_id) {
  const query = "SELECT * FROM summary WHERE project_id = $1 ORDER BY created_at DESC";
  const result = await pool.query(query, [project_id]);
  return result.rows;
}

module.exports = {
  createSummary,
  getSummaryByProject
};
