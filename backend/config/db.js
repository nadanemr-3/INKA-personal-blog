const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool for reuse across the application
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Export promise-based pool for async/await usage in controllers
const promisePool = pool.promise();

module.exports = promisePool;
