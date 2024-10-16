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

const fileFilter = (req, file, cb) => {
  // Accept image, video, and audio files only
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type. Only images, videos, and audio files are allowed.'));
  }
};

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

// // Fetch all posts
// router.get('/', authenticateToken, async (req, res) => {
//   try {
//     const result = await pool.query('SELECT * FROM public.posts');
//     res.status(200).json(result.rows);
//   } catch (err) {
//     console.error('Error fetching posts:', err.message);
//     res.status(500).json({ error: 'Error fetching posts' });
//   }
// });

// Fetch all posts and include read/unread status for the current user
router.get('/', authenticateToken, async (req, res) => {
  const userId = req.user.userId; // Assuming the user ID is extracted from the token

  try {
    const result = await pool.query(
      `SELECT p.*, 
              CASE 
                WHEN pr.user_id IS NOT NULL THEN TRUE 
                ELSE FALSE 
              END AS is_read
       FROM public.posts p
       LEFT JOIN public.post_reads pr ON p.id = pr.post_id AND pr.user_id = $1`,
      [userId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching posts:', err.message);
    res.status(500).json({ error: 'Error fetching posts' });
  }
});

// Mark a post as read
router.post('/:postId/mark-read', authenticateToken, async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.userId; // Get the userId from the authentication middleware

  try {
    // Check if the post exists
    const post = await pool.query('SELECT * FROM public.posts WHERE id = $1', [postId]);
    if (post.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Insert into post_reads if it doesn't already exist
    await pool.query(
      `INSERT INTO public.post_reads (user_id, post_id, read_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id, post_id) 
       DO UPDATE SET read_at = EXCLUDED.read_at`,
      [userId, postId]
    );

    res.status(200).json({ message: 'Post marked as read' });
  } catch (err) {
    console.error('Error marking post as read:', err.message);
    res.status(500).json({ error: 'Error marking post as read' });
  }
});

// Mark a post as unread
router.post('/:postId/mark-unread', authenticateToken, async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.userId;

  try {
    // Check if the post exists
    const post = await pool.query('SELECT * FROM public.posts WHERE id = $1', [postId]);
    if (post.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Delete the entry from post_reads to mark as unread
    await pool.query('DELETE FROM public.post_reads WHERE user_id = $1 AND post_id = $2', [userId, postId]);

    res.status(200).json({ message: 'Post marked as unread' });
  } catch (err) {
    console.error('Error marking post as unread:', err.message);
    res.status(500).json({ error: 'Error marking post as unread' });
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

router.post('/:postId/mark-read', authenticateToken, postController.markAsRead);

router.post('/:postId/mark-unread', authenticateToken, postController.markAsUnread);

router.get('/:postId/is-read', authenticateToken, postController.isPostRead);



// // Like a post
// router.post('/:id/like', authenticateToken, async (req, res) => {
//   const { id } = req.params;
//   try {
//     const result = await pool.query(
//       'UPDATE public.posts SET likes = likes + 1 WHERE id = $1 RETURNING *',
//       [id]
//     );
//     res.status(200).json(result.rows[0]);
//   } catch (err) {
//     console.error('Error liking post:', err.message);
//     res.status(500).json({ error: 'Error liking post' });
//   }
// });

// // Dislike a post
// router.post('/:id/dislike', authenticateToken, async (req, res) => {
//   const { id } = req.params;
//   try {
//     const result = await pool.query(
//       'UPDATE public.posts SET dislikes = dislikes + 1 WHERE id = $1 RETURNING *',
//       [id]
//     );
//     res.status(200).json(result.rows[0]);
//   } catch (err) {
//     console.error('Error disliking post:', err.message);
//     res.status(500).json({ error: 'Error disliking post' });
//   }
// });

module.exports = router;
