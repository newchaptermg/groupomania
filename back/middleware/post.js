
const express = require('express');
const Post = require('../models/Post');
const authenticateToken = require('../middleware/auth'); // Import the middleware
const router = express.Router();


router.post('/create', authenticateToken, async (req, res) => {
  const { title, content } = req.body;
  const mediaUrl = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const newPost = await Post.create(title, content, req.user.userId, mediaUrl); // req.user.userId from JWT
    res.status(201).json(newPost);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
