const express = require('express');
const router = express.Router();
const {
    register,
    login,
    logout,
    renderLogin,
    renderRegister,
    renderProfile,
    renderInbox,
    updateProfile
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// View routes
router.get('/login', renderLogin);
router.get('/register', renderRegister);
router.get('/logout', logout);
router.get('/profile', protect, renderProfile);
router.get('/inbox', protect, renderInbox);

// API routes
router.post('/api/register', register);
router.post('/api/login', login);
router.put('/api/profile', protect, updateProfile);

module.exports = router;
