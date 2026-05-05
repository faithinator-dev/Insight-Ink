require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const postRoutes = require('./routes/postRoutes');
const mailRoutes = require('./routes/mailRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Global User Middleware for EJS
app.use(async (req, res, next) => {
    res.locals.user = null;
    const token = req.cookies.token;
    
    if (token && token !== 'none') {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const foundUser = await User.findById(decoded.id);
            if (foundUser) {
                res.locals.user = foundUser;
            }
        } catch (err) {
            // Token invalid or expired
            res.clearCookie('token');
        }
    }
    next();
});

// Routes
app.use('/', authRoutes);
app.use('/', postRoutes);
app.use('/api/mail', mailRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).render('post', { post: { title: '404', content: 'Page not found', createdAt: new Date() } });
});

// Listening to the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
