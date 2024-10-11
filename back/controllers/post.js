const Post = require('../models/Post');
const pool = require('../db');

// Create a new post
exports.createPost = async (req, res, next) => {
    const { title, content } = req.body;
    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const userId = req.user.userId;
    try {
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }

        const result = await Post.create(title, content, userId, mediaUrl);
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
    console.log('User making post:', req.user);

};

// Fetch all posts with user information

// v1 exports.getAllPosts = async (req, res, next) => {
//     try {
//         const posts = await Post.findAllWithUser();
//         res.status(200).json(posts);
//     } catch (err) {
//         next(err);
//     }
// };

// v2 exports.getAllPosts = async (req, res, next) => {
//     try {
//         const result = await pool.query(`
//             SELECT p.id, p.title, p.content, p.media_url, p.likes, p.dislikes, p.created_at, u.username AS createdBy
//             FROM public.posts p
//             JOIN public.users u ON p.created_by = u.id
//         `);

//         res.status(200).json(result.rows);
//     } catch (err) {
//         console.error('Error fetching posts:', err.message);
//         res.status(500).json({ error: 'Error fetching posts' });
//     }
// };

exports.getAllPosts = async (req, res, next) => {
    const { userId } = req.user;

    try {
        const result = await pool.query(`
            SELECT p.id, p.title, p.content, p.media_url, 
                CASE WHEN pr.id IS NOT NULL THEN TRUE ELSE FALSE END AS isRead
            FROM public.posts p
            LEFT JOIN public.post_reads pr ON p.id = pr.post_id AND pr.user_id = $1
        `, [userId]);

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error fetching posts:', err.message);
        res.status(500).json({ error: 'Error fetching posts' });
    }
};

// Fetch posts by a specific user
exports.getUserPosts = async (req, res, next) => {
    const { userId } = req.params;
    try {
        const posts = await Post.findByUser(userId);
        res.status(200).json(posts);
    } catch (err) {
        next(err);
    }
};

// Delete a post

exports.deletePost = async (req, res, next) => {
    const { id } = req.params;
    const { userId } = req.user; // Extract userId from the token

    try {
        // Find the post by ID
        const result = await pool.query('SELECT * FROM public.posts WHERE id = $1', [id]);
        const post = result.rows[0];

        // If the post does not exist
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if the post was created by the authenticated user
        if (post.created_by !== userId) {
            return res.status(403).json({ error: 'You are not authorized to delete this post' });
        }

        // Delete the post
        await pool.query('DELETE FROM public.posts WHERE id = $1', [id]);
        res.status(200).json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error('Error deleting post:', err);
        next(err);
    }
};

// exports.deletePost = async (req, res, next) => {
//     const { id } = req.params;
//     const { userId } = req.user;

//     try {
//         const post = await Post.findById(id);
//         if (!post) {
//             return res.status(404).json({ error: 'Post not found' });
//         }

//         if (post.created_by !== userId) {
//             return res.status(403).json({ error: 'You do not have permission to delete this post' });
//         }

//         await Post.delete(id);
//         res.status(200).json({ message: 'Post deleted successfully' });
//     } catch (err) {
//         next(err);
//     }
// };

// Read a post

exports.markPostAsRead = async (req, res, next) => {
    const { postId } = req.params;
    const { userId } = req.user; // Extracted from the token

    try {
        // Check if the record already exists
        const result = await pool.query(
            'SELECT * FROM public.post_reads WHERE user_id = $1 AND post_id = $2',
            [userId, postId]
        );

        // If the record doesn't exist, create a new entry
        if (result.rows.length === 0) {
            await pool.query(
                'INSERT INTO public.post_reads (user_id, post_id) VALUES ($1, $2)',
                [userId, postId]
            );
            res.status(201).json({ message: 'Post marked as read' });
        } else {
            res.status(200).json({ message: 'Post is already marked as read' });
        }
    } catch (err) {
        console.error('Error marking post as read:', err);
        res.status(500).json({ error: 'Error marking post as read' });
    }
};

// Unread a post

exports.markPostAsUnread = async (req, res, next) => {
    const { postId } = req.params;
    const { userId } = req.user; // Extracted from the token

    try {
        // Delete the record indicating the post was read
        await pool.query(
            'DELETE FROM public.post_reads WHERE user_id = $1 AND post_id = $2',
            [userId, postId]
        );
        res.status(200).json({ message: 'Post marked as unread' });
    } catch (err) {
        console.error('Error marking post as unread:', err);
        res.status(500).json({ error: 'Error marking post as unread' });
    }
};


// Like a post
exports.likePost = async (req, res, next) => {
    const { id } = req.params;
    const { userId } = req.user;

    try {
        await Post.like(id, userId);
        res.status(200).json({ message: 'Post liked successfully' });
    } catch (err) {
        next(err);
    }
};

// Dislike a post
exports.dislikePost = async (req, res, next) => {
    const { id } = req.params;
    const { userId } = req.user;

    try {
        await Post.dislike(id, userId);
        res.status(200).json({ message: 'Post disliked successfully' });
    } catch (err) {
        next(err);
    }
};


