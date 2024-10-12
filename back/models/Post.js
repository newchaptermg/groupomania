const pool = require('../db');

class Post {
  // Create a new post in the database
  static async create(title, content, createdBy, mediaUrl = null) {
    const result = await pool.query(
      'INSERT INTO public.posts (title, content, created_by, media_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content, createdBy, mediaUrl]
    );
    return result.rows[0];
  }

  // Fetch all posts from the database
  static async findAll() {
    const result = await pool.query('SELECT * FROM public.posts');
    return result.rows;
  }

  // Fetch posts by user
  static async findByUser(userId) {
    const result = await pool.query('SELECT * FROM public.posts WHERE created_by = $1', [userId]);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query('SELECT * FROM public.posts WHERE id = $1', [id]);
    return result.rows[0];
  }
  
  static async delete(id) {
    const result = await pool.query('DELETE FROM public.posts WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }
  
}

module.exports = Post;
