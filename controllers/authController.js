const User = require('../models/User');
const jwt = require('jsonwebtoken');

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const user = await User.create({
            name,
            email,
            password,
            role: 'user'
        });

        sendTokenResponse(user, 201, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate email & password
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide an email and password' });
        }

        // Check for user
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Log user out / clear cookie
// @route   GET /api/auth/logout
exports.logout = (req, res) => {
    res.clearCookie('token');

    if (req.accepts('html')) {
        return res.redirect('/login');
    }

    res.status(200).json({ success: true, data: {} });
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });

    const options = {
        expires: new Date(
            Date.now() + (process.env.JWT_COOKIE_EXPIRE || 30) * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };

    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
};

// Render Login Page
exports.renderLogin = (req, res) => {
    res.render('login');
};

// Render Register Page
exports.renderRegister = (req, res) => {
    res.render('register');
};

// Render Profile Page
exports.renderProfile = (req, res) => {
    res.render('profile', { profileUser: req.user });
};

// Update Profile
exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('+password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { name, email, currentPassword, newPassword, confirmPassword } = req.body;

        if (name) {
            user.name = name;
        }

        if (email) {
            user.email = email;
        }

        if (newPassword || confirmPassword || currentPassword) {
            if (!currentPassword || !newPassword || !confirmPassword) {
                return res.status(400).json({ message: 'Current password, new password, and confirmation are required.' });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({ message: 'New password and confirmation do not match.' });
            }

            const isMatch = await user.matchPassword(currentPassword);
            if (!isMatch) {
                return res.status(401).json({ message: 'Current password is incorrect.' });
            }

            user.password = newPassword;
        }

        await user.save();

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                username: user.username,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already exists.' });
        }

        res.status(500).json({ message: error.message });
    }
};
