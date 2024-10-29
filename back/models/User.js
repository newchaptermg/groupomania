const pool = require('../db');
const bcrypt = require('bcryptjs');  
class User {
  
  static async create(username, email, password) {
    // Debugging: Log the values being passed to the database
    console.log('Creating User with Data:', { username, email, password });

    const result = await pool.query(
      'INSERT INTO public.users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
      [username, email, password]  // Use the hashed password passed from auth.js
    );
    return result.rows[0];
  }

  // Find a user by email
  static async findByEmail(email) {
    // const result = await pool.query('SELECT * FROM public.users WHERE email = $1', [email]);
    const result = await pool.query('SELECT * FROM public.users WHERE email = $1 AND deleted_at IS NULL',[email]);
    return result.rows[0];
  }

  static async findById(id) {
    // const result = await pool.query('SELECT * FROM public.users WHERE id = $1', [id]);
    const result = await pool.query('SELECT * FROM public.users WHERE id = $1 AND deleted_at IS NULL',[id]);
    return result.rows[0];
  }
  
}

module.exports = User;
