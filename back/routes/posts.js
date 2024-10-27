const express = require('express');
const router = express.Router();
const pool = require('../db');
const postController = require('../controllers/post');
const multer = require('multer');
const authenticateToken = require('../middleware/auth');
const upload = require('../middleware/fileUpload');

router.post('/create', authenticateToken, upload.single('media'), postController.createPost);
router.get('/', authenticateToken, postController.getAllPosts);
router.get('/:id', authenticateToken, postController.getPostById);
router.delete('/:id', authenticateToken, postController.deletePost);
router.post('/:postId/mark-read', authenticateToken, postController.markAsRead);
router.post('/:postId/mark-unread', authenticateToken, postController.markAsUnread);

module.exports = router;
