const express = require('express');
const router = express.Router();
const {
    register,
    login,
    logout,
    renderLogin,
    renderRegister
} = require('../controllers/authController');

// View routes
router.get('/login', renderLogin);
router.get('/register', renderRegister);
router.get('/logout', logout);

// API routes
router.post('/api/register', register);
router.post('/api/login', login);

module.exports = router;
