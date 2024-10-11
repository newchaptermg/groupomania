const { Pool } = require('pg');

// Initialize the connection pool using the environment variable
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Necessary for certain hosting environments, like Heroku
  },
});

// Set the search path to 'public' and handle any errors during the setup
pool.on('connect', (client) => {
  client
    .query('SET search_path TO public')
    .then(() => {
      console.log('Search path set to public');
    })
    .catch((err) => {
      console.error('Error setting search path:', err);
    });
});

// Export the pool for use in other parts of the application
module.exports = pool;
