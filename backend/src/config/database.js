const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 5433,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD) : "",
  database: process.env.DB_NAME,
});

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
});

module.exports = pool;
