const express = require('express');
const postController = require('../controllers/post');
const authenticateToken = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});

const fileFilter = (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif|mp4|mp3/;
    const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = fileTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('File type not allowed. Only images, mp4, and mp3 files are accepted.'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: fileFilter
});

router.post('/create', authenticateToken, upload.single('media'), postController.createPost);
router.get('/', authenticateToken, postController.getAllPosts);
router.get('/user/:userId', authenticateToken, postController.getUserPosts);
router.post('/:postId/read', authenticateToken, postController.markPostAsRead);
router.delete('/:postId/read', authenticateToken, postController.markPostAsUnread);
router.post('/:id/like', authenticateToken, postController.likePost);
router.post('/:id/dislike', authenticateToken, postController.dislikePost);
router.delete('/:id', authenticateToken, postController.deletePost);

module.exports = router;
