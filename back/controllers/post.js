const Post = require('../models/Post');
const pool = require('../db');
const express = require('express');
const router = express.Router();
const { getAllPosts } = require('../controllers/post');
const authenticateToken = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

// Function to create a new post
exports.createPost = async (req, res) => {
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
};

// Function to fetch all posts
exports.getAllPosts = async (req, res) => {
  const userId = req.user.userId;
  console.log('Fetching posts for user ID:', userId);
  try {
    const result = await pool.query(`
      SELECT p.id, p.title, p.content, p.media_url, p.created_at, p.created_by, u.username AS author,
             COALESCE(pr.read_at IS NOT NULL, false) AS is_read
      FROM public.posts p
      JOIN public.users u ON p.created_by = u.id
      LEFT JOIN public.post_reads pr ON p.id = pr.post_id AND pr.user_id = $1
      ORDER BY p.created_at DESC
    `, [userId]);

    console.log('Query result:', result.rows);
    
    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching posts:', err.message);
    res.status(500).json({ error: 'Error fetching posts' });
  }
};

// Function to fetch a single post by ID
exports.getPostById = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      'SELECT p.*, u.username as author FROM public.posts p JOIN public.users u ON p.created_by = u.id WHERE p.id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching post:', err.message);
    res.status(500).json({ error: 'Error fetching post' });
  }
};

exports.deletePost = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const postResult = await pool.query('SELECT * FROM public.posts WHERE id = $1', [id]);

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = postResult.rows[0];

    // Verify that the logged-in user is the creator of the post
    if (post.created_by !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this post' });
    }

    // Delete the media file if it exists
    if (post.media_url) {
      const filePath = path.join(__dirname, '..', post.media_url); // Use media_url directly
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`Error deleting media file at ${filePath}:`, err);
        } else {
          console.log('Media file deleted successfully');
        }
      });
    }

    // Delete the post from the database
    await pool.query('DELETE FROM public.posts WHERE id = $1', [id]);
    res.status(200).json({ message: 'Post and associated media deleted successfully' });
  } catch (err) {
    console.error('Error deleting post:', err.message);
    res.status(500).json({ error: 'Error deleting post' });
  }
};

// // Delete a post before Oct 27 
// exports.deletePost = async (req, res) => {
//   const { id } = req.params;
//   const userId = req.user.userId;

//   try {
//     const post = await pool.query('SELECT * FROM public.posts WHERE id = $1', [id]);

//     if (post.rows.length === 0) {
//       return res.status(404).json({ error: 'Post not found' });
//     }

//     if (post.rows[0].created_by !== userId) {
//       return res.status(403).json({ error: 'You do not have permission to delete this post' });
//     }

//     if (post.media_url) {
//       const filePath = path.join(__dirname, '..', post.media_url);  // Adjust the path to your project structure
//       fs.unlink(filePath, (err) => {
//         if (err) {
//           console.error('Error deleting media file:', err);
//         } else {
//           console.log('Media file deleted successfully');
//         }
//       });
//     }

//     await pool.query('DELETE FROM public.posts WHERE id = $1', [id]);
//     res.status(200).json({ message: 'Post deleted successfully' });
//   } catch (err) {
//     console.error('Error deleting post:', err.message);
//     res.status(500).json({ error: 'Error deleting post' });
//   }
// };


// Mark a post as read
exports.markAsRead = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.userId;

  try {
    const post = await pool.query('SELECT * FROM public.posts WHERE id = $1', [postId]);
    if (post.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await pool.query(
      'INSERT INTO public.post_reads (user_id, post_id, read_at) VALUES ($1, $2, NOW()) ON CONFLICT (user_id, post_id) DO UPDATE SET read_at = EXCLUDED.read_at',
      [userId, postId]
    );

    res.status(200).json({ message: 'Post marked as read' });
  } catch (err) {
    console.error('Error marking post as read:', err.message);
    res.status(500).json({ error: 'Error marking post as read' });
  }
};

// Mark a post as unread
exports.markAsUnread = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user.userId;

  try {
    await pool.query(
      'DELETE FROM public.post_reads WHERE user_id = $1 AND post_id = $2',
      [userId, postId]
    );
    res.status(200).json({ message: 'Post marked as unread' });
  } catch (err) {
    console.error('Error marking post as unread:', err.message);
    res.status(500).json({ error: 'Error marking post as unread' });
  }
};

// ----------- oct 19 comment
// const Post = require('../models/Post');
// const pool = require('../db');

// // Function to create a new post
// exports.createPost = async (req, res) => {
//     const { title, content } = req.body;
//     // const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;
//     const mediaUrl = req.file ? `${process.env.BASE_URL}/uploads/${req.file.filename}` : null;
//     const userId = req.user.id; // Assumes the user ID is set by the authentication middleware   

//     try {
//         if (!title || !content) {
//             return res.status(400).json({ error: 'Title and content are required' });
//         }

//         // Fetch the username based on the user ID
//         const userResult = await pool.query('SELECT username FROM public.users WHERE id = $1', [userId]);
//         const username = userResult.rows[0]?.username;

//         if (!username) {
//             return res.status(400).json({ error: 'User not found' });
//         }

//         // Insert the new post along with the username
//         const result = await pool.query(
//             `INSERT INTO public.posts (title, content, media_url, created_by, username) 
//              VALUES ($1, $2, $3, $4, $5) RETURNING *`,
//             [title, content, mediaUrl, userId, username]
//         );

//         res.status(201).json(result.rows[0]);
//     } catch (err) {
//         console.error('Error creating post:', err);
//         res.status(500).json({ error: 'Server error' });
//     }
// };


// // Function to fetch all posts
// exports.getAllPosts = async (req, res, next) => {
//     const userId = req.user.id; // Get the user ID from the authenticated user
  
//     try {
//       // Query to fetch posts and read status for the current user
//       const result = await pool.query(`
//         SELECT p.id, p.title, p.content, p.media_url, p.created_at, p.created_by, u.username AS author,
//                COALESCE(pr.read_at IS NOT NULL, false) AS is_read
//         FROM public.posts p
//         JOIN public.users u ON p.created_by = u.id
//         LEFT JOIN post_reads pr ON p.id = pr.post_id AND pr.user_id = $1
//         ORDER BY p.created_at DESC
//       `, [userId]);
  
//       res.status(200).json(result.rows);
//     } catch (err) {
//       console.error('Error fetching posts:', err.message);
//       res.status(500).json({ error: 'Error fetching posts' });
//     }
//   };
  
// // exports.getAllPosts = async (req, res, next) => {
// //     try {
// //         const result = await pool.query(`
// //            SELECT p.id, p.title, p.content, p.media_url, p.created_at,p.created_by, u.username AS author
// //             FROM public.posts p
// //             JOIN public.users u ON p.created_by = u.id
// //         `);

// //         res.status(200).json(result.rows);
// //     } catch (err) {
// //         console.error('Error fetching posts:', err.message);
// //         res.status(500).json({ error: 'Error fetching posts' });
// //     }
// //     console.log('Media URL:', mediaUrl);
// // };

// // Function to fetch a single post by ID
// // post.js (Controller)

// exports.getPostById = async (req, res) => {
//     const { id } = req.params;
//     try {
//         const result = await pool.query(
//             `SELECT p.*, u.username as author 
//             FROM public.posts p 
//             JOIN public.users u ON p.created_by = u.id 
//             WHERE p.id = $1`,
//             [id]
//         );
//         if (result.rows.length === 0) {
//             return res.status(404).json({ error: 'Post not found' });
//         }
//         const post = result.rows[0];
//         res.json({
//             id: post.id,
//             title: post.title,
//             content: post.content,
//             imageUrl: `${process.env.BASE_URL}/uploads/${post.media_url}`,
//             createdAt: post.created_at,
//             user: post.author
//         });
//     } catch (err) {
//         console.error('Error fetching post:', err.message);
//         res.status(500).json({ error: 'Error fetching post' });
//     }
// };


// // Function to delete a post
// exports.deletePost = async (req, res) => {
//     const { id } = req.params;
//     const userId = req.user.id; // User ID from the authentication middleware

//     try {
//         // Check if the post exists and if the user is authorized to delete it
//         const postResult = await pool.query('SELECT * FROM public.posts WHERE id = $1', [id]);

//         if (postResult.rows.length === 0) {
//             return res.status(404).json({ error: 'Post not found.' });
//         }

//         const post = postResult.rows[0];

//         // Check if the post was created by the logged-in user
//         if (post.created_by !== userId) {
//             return res.status(403).json({ error: 'You are not authorized to delete this post.'  });
//         }

//         // Delete the post
//         await pool.query('DELETE FROM public.posts WHERE id = $1', [id]);
//         res.status(200).json({ message: 'Post deleted successfully.' });
//     } catch (err) {
//         console.error('Error deleting post:', err.message);
//         res.status(500).json({ error: 'Internal server error. Please try again later.' });
//     }
// };

// exports.isPostRead = async (req, res) => {
//     const { userId } = req.user;
//     const { postId } = req.params;
  
//     try {
//       const result = await pool.query(
//         'SELECT * FROM post_reads WHERE user_id = $1 AND post_id = $2',
//         [userId, postId]
//       );
  
//       if (result.rows.length > 0) {
//         return res.status(200).json({ read: true });
//       } else {
//         return res.status(200).json({ read: false });
//       }
//     } catch (err) {
//       console.error('Error checking if post is read:', err);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   };
  
//   // exports.markAsRead = async (req, res) => {
//   //   const { userId } = req.user.userId;
//   //   const { postId } = req.params;
  
//   //   try {
//   //     await pool.query(
//   //       'INSERT INTO post_reads (user_id, post_id, read_at) VALUES ($1, $2, NOW()) ON CONFLICT (user_id, post_id) DO NOTHING',
//   //       [userId, postId]
//   //     );
//   //     res.status(200).json({ message: 'Post marked as read' });
//   //   } catch (err) {
//   //     console.error('Error marking post as read:', err);
//   //     res.status(500).json({ error: 'Internal server error' });
//   //   }
//   // };

//   // Mark a post as read
// exports.markAsRead = async (req, res) => {
//   const { postId } = req.params;
//   const userId = req.user.userId; // Get the userId from the authentication middleware

//   try {
//     // Check if the post exists
//     const post = await pool.query('SELECT * FROM public.posts WHERE id = $1', [postId]);
//     if (post.rows.length === 0) {
//       return res.status(404).json({ error: 'Post not found' });
//     }

//     // Insert into post_reads if it doesn't already exist
//     await pool.query(
//       `INSERT INTO public.post_reads (user_id, post_id, read_at)
//        VALUES ($1, $2, NOW())
//        ON CONFLICT (user_id, post_id) 
//        DO UPDATE SET read_at = EXCLUDED.read_at`,
//       [userId, postId]
//     );

//     res.status(200).json({ message: 'Post marked as read' });
//   } catch (err) {
//     console.error('Error marking post as read:', err.message);
//     res.status(500).json({ error: 'Error marking post as read' });
//   }
// };

  
//   exports.markAsUnread = async (req, res) => {
//     const { userId } = req.user;
//     const { postId } = req.params;
  
//     try {
//       await pool.query(
//         'DELETE FROM post_reads WHERE user_id = $1 AND post_id = $2',
//         [userId, postId]
//       );
//       res.status(200).json({ message: 'Post marked as unread' });
//     } catch (err) {
//       console.error('Error marking post as unread:', err);
//       res.status(500).json({ error: 'Internal server error' });
//     }
//   };
  