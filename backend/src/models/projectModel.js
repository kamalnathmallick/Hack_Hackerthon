const pool = require("../config/database");

async function createProject({ title, problem_statement, description, created_by, status }) {
  const query = `
    INSERT INTO projects (title, problem_statement, description, created_by, status)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [title, problem_statement, description || "", created_by, status || "GENERATING"];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function getAllProjects() {
  const query = "SELECT * FROM projects ORDER BY created_at DESC";
  const result = await pool.query(query);
  return result.rows;
}

async function getProjectsForUser(userId, role) {
  const upperRole = String(role || "").toUpperCase();
  if (upperRole === "TEAM_LEADER" || upperRole === "LEADER") {
    // Leader sees projects they created, or where tasks are assigned to them
    const query = `
      SELECT DISTINCT p.* FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id
      WHERE p.created_by = $1 OR t.assigned_to = $1
      ORDER BY p.created_at DESC;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  } else {
    // Member sees projects where they have assigned tasks, or which they created
    const query = `
      SELECT DISTINCT p.* FROM projects p
      INNER JOIN tasks t ON p.id = t.project_id
      WHERE t.assigned_to = $1 OR p.created_by = $1
      ORDER BY p.created_at DESC;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
}

async function getProjectById(id) {
  const query = "SELECT * FROM projects WHERE id = $1";
  const result = await pool.query(query, [id]);
  return result.rows[0];
}

async function updateProject(id, updates) {
  const { title, problem_statement, description, status } = updates;
  const query = `
    UPDATE projects 
    SET title = COALESCE($1, title),
        problem_statement = COALESCE($2, problem_statement),
        description = COALESCE($3, description),
        status = COALESCE($4, status)
    WHERE id = $5
    RETURNING *;
  `;
  const values = [title, problem_statement, description, status, id];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function deleteProject(id) {
  const query = "DELETE FROM projects WHERE id = $1 RETURNING *";
  const result = await pool.query(query, [id]);
  return result.rows[0];
}

module.exports = {
  createProject,
  getAllProjects,
  getProjectsForUser,
  getProjectById,
  updateProject,
  deleteProject
};
