const { Pool } = require('pg');
const path = require('path');

// Reuse existing Sequelize config.json for connection details
const env = process.env.NODE_ENV || 'development';
// eslint-disable-next-line import/no-dynamic-require, global-require
const config = require(path.join(__dirname, 'config.json'))[env];

const pool = new Pool({
  host: config.host,
  user: config.username,
  password: config.password,
  database: config.database,
  // Allow DATABASE_URL override if present
  connectionString: process.env.DATABASE_URL || undefined,
});

module.exports = pool;

