const pool = require("../config/database");

async function createPPT({ project_id, ppt_text, slides_json }) {
  const query = `
    INSERT INTO ppt_outputs (project_id, ppt_text, slides_json)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const jsonVal = slides_json ? (typeof slides_json === "string" ? slides_json : JSON.stringify(slides_json)) : null;
  const values = [project_id, ppt_text, jsonVal];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function getPPTByProject(project_id) {
  const query = "SELECT * FROM ppt_outputs WHERE project_id = $1 ORDER BY created_at DESC";
  const result = await pool.query(query, [project_id]);
  return result.rows;
}

module.exports = {
  createPPT,
  getPPTByProject
};
