const Post = require('../models/Post');
const pool = require('../db');

// Function to create a new post
exports.createPost = async (req, res) => {
    const { title, content } = req.body;
    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const userId = req.user.id; // Assumes the user ID is set by the authentication middleware

    try {
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        // Fetch the username based on the user ID
        const userResult = await pool.query('SELECT username FROM public.users WHERE id = $1', [userId]);
        const username = userResult.rows[0]?.username;

        if (!username) {
            return res.status(400).json({ error: 'User not found' });
        }
        
        const result = await pool.query(
            `INSERT INTO public.posts (title, content, media_url, created_by) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [title, content, mediaUrl, userId]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating post:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

// Function to fetch all posts
exports.getAllPosts = async (req, res, next) => {
    try {
        const result = await pool.query(`
           SELECT p.id, p.title, p.content, p.media_url, p.created_at, u.username AS author
            FROM public.posts p
            JOIN public.users u ON p.created_by = u.id
        `);

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching posts:', err.message);
        res.status(500).json({ error: 'Error fetching posts' });
    }
};

// Function to fetch a single post by ID
// post.js (Controller)

exports.getPostById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            `SELECT p.*, u.username as author 
            FROM public.posts p 
            JOIN public.users u ON p.created_by = u.id 
            WHERE p.id = $1`,
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Post not found' });
        }
        const post = result.rows[0];
        res.json({
            id: post.id,
            title: post.title,
            content: post.content,
            imageUrl: `${process.env.BASE_URL}/uploads/${post.media_url}`,
            createdAt: post.created_at,
            user: post.author
        });
    } catch (err) {
        console.error('Error fetching post:', err.message);
        res.status(500).json({ error: 'Error fetching post' });
    }
};


// Function to delete a post
exports.deletePost = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const postResult = await pool.query(
            `SELECT * FROM public.posts WHERE id = $1 AND created_by = $2`,
            [id, userId]
        );

        if (postResult.rows.length === 0) {
            return res.status(403).json({ error: 'You are not authorized to delete this post.' });
        }

        await pool.query(`DELETE FROM public.posts WHERE id = $1`, [id]);
        res.status(200).json({ message: 'Post deleted successfully.' });
    } catch (err) {
        console.error('Error deleting post:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
