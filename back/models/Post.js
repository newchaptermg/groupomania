const pool = require('../db');

class Post {
    static async create(title, content, createdBy, mediaUrl = null) {
        const result = await pool.query(
            'INSERT INTO public.posts (title, content, created_by, media_url) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, content, createdBy, mediaUrl]
        );
        return result.rows[0];
    }

    static async findAllWithUser() {
        const result = await pool.query(`
            SELECT p.id, p.title, p.content, p.media_url, p.likes, p.dislikes, p.created_at, u.username
            FROM public.posts p
            JOIN public.users u ON p.created_by = u.id
        `);
        return result.rows;
    }

    static async findByUser(userId) {
        const result = await pool.query('SELECT * FROM public.posts WHERE created_by = $1', [userId]);
        return result.rows;
    }

    static async findById(id) {
        const result = await pool.query('SELECT * FROM public.posts WHERE id = $1', [id]);
        return result.rows[0];
    }

    static async delete(id) {
        await pool.query('DELETE FROM public.posts WHERE id = $1', [id]);
    }

    static async like(id, userId) {
        // Like post logic (omitted for brevity)
    }

    static async dislike(id, userId) {
        // Dislike post logic (omitted for brevity)
    }
}

module.exports = Post;
