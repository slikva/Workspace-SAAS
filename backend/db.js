const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "workspace_saas",
  password: "Vasu1603",
  port: 5432,
});

module.exports = pool;