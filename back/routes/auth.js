const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const authenticateToken = require('../middleware/auth');

// Use controller for routes
router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.get('/profile', authenticateToken, userController.getProfile);
router.delete('/delete', authenticateToken, userController.deleteUser);
router.post('/change-password', authenticateToken, userController.changePassword);

module.exports = router;


