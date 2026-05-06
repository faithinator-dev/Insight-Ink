const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

const {
    createPost,
    getPosts,
    getPost,
    renderPosts,
    renderPost,
    renderEditPost,
    updatePost,
    deletePost,
    toggleLike,
    addComment,
    updateComment,
    deleteComment,
    addReply,
} = require('../controllers/postController');

// View routes
router.get('/', renderPosts);
router.get('/post/:id', renderPost);
router.get('/edit/:id', protect, renderEditPost);
router.get('/write', protect, authorize('admin', 'user', 'superadmin'), (req, res) => {
    res.render('write');
});

// API routes
router.post('/api/posts', protect, authorize('admin', 'user', 'superadmin'), createPost); // Changed to allow 'user' too
router.get('/api/posts', getPosts);
router.get('/api/posts/:id', getPost);
router.put('/api/posts/:id', protect, updatePost);
router.delete('/api/posts/:id', protect, deletePost);
router.post('/api/posts/:id/like', protect, toggleLike);
router.post('/api/posts/:id/comment', protect, addComment);
router.put('/api/posts/:id/comment/:commentId', protect, updateComment);
router.delete('/api/posts/:id/comment/:commentId', protect, deleteComment);
router.post('/api/posts/:id/reply', protect, addReply);

module.exports = router;
