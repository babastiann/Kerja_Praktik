const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  host:     process.env.DB_HOST     || "localhost",
  port:     parseInt(process.env.DB_PORT) || 5432,
  user:     process.env.DB_USER     || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME     || "db_rumah_bandung",
  max:      10,
  idleTimeoutMillis: 30000,
});

pool.connect()
  .then(c => { console.log("PostgreSQL connected"); c.release(); })
  .catch(err => console.error("DB connection error:", err.message));

module.exports = pool;
