const pool = require("../config/database");

async function createUser({ name, email, password, role, domain }) {
  const query = `
    INSERT INTO users (name, email, password, role, domain)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;
  const values = [name, email, password, role, domain || null];
  const result = await pool.query(query, values);
  return result.rows[0];
}

async function findUserByEmail(email) {
  const query = "SELECT * FROM users WHERE email = $1";
  const result = await pool.query(query, [email]);
  return result.rows[0];
}

async function findUserById(id) {
  const query = "SELECT id, name, email, role, domain, created_at FROM users WHERE id = $1";
  const result = await pool.query(query, [id]);
  return result.rows[0];
}

async function findMembers() {
  const query = "SELECT id, name, email, role, domain FROM users WHERE UPPER(role) IN ('MEMBER', 'TEAM_MEMBER') ORDER BY name";
  const result = await pool.query(query);
  return result.rows;
}

async function updateUserPassword(email, hashedPassword) {
  const query = "UPDATE users SET password = $1 WHERE email = $2";
  await pool.query(query, [hashedPassword, email]);
}

async function updateUserProfile(email, name, domain) {
  const query = "UPDATE users SET name = $1, domain = $2 WHERE email = $3 RETURNING id, name, email, role, domain";
  const result = await pool.query(query, [name, domain, email]);
  return result.rows[0];
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  findMembers,
  updateUserPassword,
  updateUserProfile
};
