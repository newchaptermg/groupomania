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
      LEFT JOIN public.users u ON p.created_by = u.id AND u.deleted_at IS NULL
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
    const result = await pool.query(`
      SELECT p.*, u.username as author 
      FROM public.posts p 
      LEFT JOIN public.users u ON p.created_by = u.id AND u.deleted_at IS NULL 
      WHERE p.id = $1
    `, [id]);    
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


  