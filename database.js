const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'users',
  password: '1234567',
  port: 5432, 
});

module.exports = pool;
