const express = require('express');
const userController = require('../controllers/user');
const authenticateToken = require('../middleware/auth');
const router = express.Router();


router.post('/login', userController.login);
router.post('/signup', userController.signup);
router.delete('/delete', authenticateToken, userController.deleteUser);
router.get('/profile', authenticateToken, userController.getProfile); 
router.post('/change-password', authenticateToken, userController.changePassword);

module.exports = router;
