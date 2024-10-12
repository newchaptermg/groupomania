const express = require('express');
const router = express.Router();
const pool = require('../db');
const postController = require('../controllers/post');
const multer = require('multer');
const authenticateToken = require('../middleware/auth');

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Specify directory to store files
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// Create a new post with media upload
router.post('/create', authenticateToken, upload.single('media'), async (req, res) => {
  const { title, content } = req.body;
  const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      'INSERT INTO public.posts (title, content, created_by, media_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, content, userId, mediaUrl]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating post:', err.message);
    res.status(500).json({ error: 'Error creating post' });
  }
});

// Fetch all posts
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.posts');
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching posts:', err.message);
    res.status(500).json({ error: 'Error fetching posts' });
  }
});

// Fetch a single post by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM public.posts WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching post:', err.message);
    res.status(500).json({ error: 'Error fetching post' });
  }
});

// Delete a post
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const post = await pool.query('SELECT * FROM public.posts WHERE id = $1', [id]);

    if (post.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.rows[0].created_by !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this post' });
    }

    await pool.query('DELETE FROM public.posts WHERE id = $1', [id]);
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err.message);
    res.status(500).json({ error: 'Error deleting post' });
  }
});

// Like a post
router.post('/:id/like', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE public.posts SET likes = likes + 1 WHERE id = $1 RETURNING *',
      [id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error liking post:', err.message);
    res.status(500).json({ error: 'Error liking post' });
  }
});

// Dislike a post
router.post('/:id/dislike', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE public.posts SET dislikes = dislikes + 1 WHERE id = $1 RETURNING *',
      [id]
    );
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error disliking post:', err.message);
    res.status(500).json({ error: 'Error disliking post' });
  }
});

module.exports = router;
