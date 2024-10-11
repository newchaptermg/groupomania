const pool = require('../db');

class User {
    static async create(username, email, password) {
        const result = await pool.query(
            'INSERT INTO public.users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
            [username, email, password]
        );
        return result.rows[0];
    }

    static async findByEmail(email) {
        const result = await pool.query('SELECT * FROM public.users WHERE email = $1', [email]);
        return result.rows[0];
    }

    static async delete(id) {
        await pool.query('DELETE FROM public.users WHERE id = $1', [id]);
    }
}

module.exports = User;
