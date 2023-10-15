require('dotenv').config();

const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  user: isProduction ? null : process.env.PG_USER,
  host: isProduction ? null : process.env.PG_HOST,
  database: isProduction ? null : process.env.PG_DATABASE,
  password: isProduction ? null : process.env.PG_PASSWORD,
  port: isProduction ? null : process.env.PG_PORT,
  connectionString: isProduction ? process.env.DATABASE_URL : null,
  ssl: isProduction ? { rejectUnauthorized: false } : null,
});

module.exports = pool;
