const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.query('SET search_path TO public', (err, res) => {
  if (err) {
    console.error('Error setting search path:', err);
  } else {
    console.log('Search path set to public');
  }
});

  
module.exports = pool;
