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



router.post('/create', authenticateToken, upload.single('media'), postController.createPost);
router.get('/', authenticateToken, postController.getAllPosts);
router.get('/:id', authenticateToken, postController.getPostById);
router.delete('/:id', authenticateToken, postController.deletePost);
router.post('/:postId/mark-read', authenticateToken, postController.markAsRead);
router.post('/:postId/mark-unread', authenticateToken, postController.markAsUnread);

module.exports = router;
