const Post = require('../models/Post');
const { recordActivity } = require('../utils/activityLogger');
const { createNotification } = require('../utils/notificationService');

const ensurePostArrays = (post) => {
    if (!Array.isArray(post.likes)) {
        post.likes = [];
    }

    if (!Array.isArray(post.comments)) {
        post.comments = [];
    }
};

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const { title, excerpt, content, readTime } = req.body;
        const post = await Post.create({ 
            title, 
            excerpt, 
            content, 
            readTime: readTime || 5,
            author: req.user.name,
            authorId: req.user._id
        });
        await recordActivity({
            type: 'post',
            action: 'post_created',
            userId: req.user._id,
            userName: req.user.name,
            role: req.user.role,
            entityType: 'post',
            entityId: String(post._id),
            entityName: post.title,
            metadata: { readTime: post.readTime },
        });
        res.status(201).json(post);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'A post with this title already exists.' });
        }
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// Get all posts
exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        console.error('getPosts error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get a single post
exports.getPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json(post);
    } catch (error) {
        console.error('getPost error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Render posts list
exports.renderPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.render('posts', { posts });
    } catch (error) {
        res.status(500).send('Server Error');
    }
};

// Render single post
exports.renderPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).render('post', { post: { title: '404', content: 'Page not found', createdAt: new Date(), authorId: '' } });
        }
        res.render('post', { post });
    } catch (error) {
        res.status(500).send('Server Error');
    }
};

// Toggle Like
exports.toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        ensurePostArrays(post);

        const isLiked = post.likes.some((likeId) => likeId.toString() === req.user._id.toString());
        const action = isLiked ? 'post_unliked' : 'post_liked';

        if (isLiked) {
            await Post.updateOne({ _id: post._id }, { $pull: { likes: req.user._id } });
        } else {
            await Post.updateOne({ _id: post._id }, { $addToSet: { likes: req.user._id } });
        }

        const updatedPost = await Post.findById(post._id).select('likes').lean();
        const likes = Array.isArray(updatedPost?.likes) ? updatedPost.likes : [];
        await recordActivity({
            type: 'post',
            action,
            userId: req.user._id,
            userName: req.user.name,
            role: req.user.role,
            entityType: 'post',
            entityId: String(post._id),
            entityName: post.title,
        });
        res.json({ success: true, likes: likes.length, isLiked: !isLiked });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Add Comment
exports.addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        ensurePostArrays(post);

        const newComment = {
            text,
            author: req.user.name,
            authorId: req.user._id,
            date: new Date(),
            replies: []
        };

        await Post.updateOne({ _id: post._id }, { $push: { comments: newComment } });

        const updatedPost = await Post.findById(post._id).select('comments').lean();
        const comment = updatedPost?.comments?.[updatedPost.comments.length - 1] || newComment;

        await recordActivity({
            type: 'comment',
            action: 'comment_created',
            userId: req.user._id,
            userName: req.user.name,
            role: req.user.role,
            entityType: 'comment',
            entityId: String(comment._id),
            entityName: post.title,
        });

        res.json({ success: true, comment });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Render edit post form
exports.renderEditPost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).render('post', { post: { title: '404', content: 'Page not found' } });
        ensurePostArrays(post);
        
        // Check if user is author or admin
        if (post.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(401).redirect('/post/' + post._id);
        }
        
        res.render('edit', { post });
    } catch (error) {
        res.status(500).send('Server Error');
    }
};

// Update post
exports.updatePost = async (req, res) => {
    try {
        let post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        ensurePostArrays(post);

        // Check ownership
        if (post.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(401).json({ message: 'Not authorized to update this post' });
        }

        const { title, excerpt, content, readTime } = req.body;
        
        post.title = title || post.title;
        post.excerpt = excerpt || post.excerpt;
        post.content = content || post.content;
        post.readTime = readTime || post.readTime;

        await post.save();
        await recordActivity({
            type: 'post',
            action: 'post_updated',
            userId: req.user._id,
            userName: req.user.name,
            role: req.user.role,
            entityType: 'post',
            entityId: String(post._id),
            entityName: post.title,
        });
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Delete post
exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        ensurePostArrays(post);

        // Check ownership
        if (post.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(401).json({ message: 'Not authorized to delete this post' });
        }

        const deleteReason = (req.body && req.body.deleteReason ? String(req.body.deleteReason) : '').trim();

        if ((req.user.role === 'admin' || req.user.role === 'superadmin') && !deleteReason) {
            return res.status(400).json({ message: 'Please provide a delete reason for this notice.' });
        }

        await post.deleteOne();
        await recordActivity({
            type: 'post',
            action: 'post_deleted',
            userId: req.user._id,
            userName: req.user.name,
            role: req.user.role,
            entityType: 'post',
            entityId: String(post._id),
            entityName: post.title,
            message: deleteReason,
        });

        if (req.user.role === 'admin' || req.user.role === 'superadmin') {
            await createNotification({
                userId: post.authorId,
                type: 'post_deleted',
                title: 'Your post was removed',
                message: deleteReason,
                relatedEntityId: String(post._id),
                relatedEntityType: 'post',
                createdBy: req.user._id,
            });
        }
        res.json({ success: true, message: 'Post removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Update Comment
exports.updateComment = async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        ensurePostArrays(post);

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        // Check authorization: only comment author or admin can EDIT
        if (comment.authorId.toString() !== req.user._id.toString() && 
            req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(401).json({ message: 'Not authorized to edit this comment' });
        }

        await Post.updateOne(
            { _id: post._id, 'comments._id': req.params.commentId },
            { $set: { 'comments.$.text': text } }
        );
        await recordActivity({
            type: 'comment',
            action: 'comment_updated',
            userId: req.user._id,
            userName: req.user.name,
            role: req.user.role,
            entityType: 'comment',
            entityId: String(comment._id),
            entityName: post.title,
        });

        comment.text = text;
        res.json({ success: true, comment });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Delete Comment
exports.deleteComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        ensurePostArrays(post);

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        // Check authorization: comment author, post author, or admin
        if (comment.authorId.toString() !== req.user._id.toString() && 
            post.authorId.toString() !== req.user._id.toString() && 
            req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const deleteReason = (req.body && req.body.deleteReason ? String(req.body.deleteReason) : '').trim();

        if ((req.user.role === 'admin' || req.user.role === 'superadmin') && !deleteReason) {
            return res.status(400).json({ message: 'Please provide a delete reason for this notice.' });
        }

        await Post.updateOne(
            { _id: post._id },
            { $pull: { comments: { _id: comment._id } } }
        );

        await recordActivity({
            type: 'comment',
            action: 'comment_deleted',
            userId: req.user._id,
            userName: req.user.name,
            role: req.user.role,
            entityType: 'comment',
            entityId: String(comment._id),
            entityName: post.title,
            message: deleteReason,
        });

        if (req.user.role === 'admin' || req.user.role === 'superadmin') {
            await createNotification({
                userId: comment.authorId,
                type: 'comment_deleted',
                title: 'Your comment was removed',
                message: deleteReason,
                relatedEntityId: String(comment._id),
                relatedEntityType: 'comment',
                createdBy: req.user._id,
            });
        }

        res.json({ success: true, message: 'Comment deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error: ' + error.message });
    }
};

// Add Reply
exports.addReply = async (req, res) => {
    try {
        const { text, commentId } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        ensurePostArrays(post);

        const comment = post.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        const newReply = {
            text,
            author: req.user.name,
            authorId: req.user._id,
            date: new Date()
        };

        await Post.updateOne(
            { _id: post._id, 'comments._id': comment._id },
            { $push: { 'comments.$.replies': newReply } }
        );

        await recordActivity({
            type: 'comment',
            action: 'reply_created',
            userId: req.user._id,
            userName: req.user.name,
            role: req.user.role,
            entityType: 'reply',
            entityId: String(comment._id),
            entityName: post.title,
        });

        res.json({ success: true, reply: newReply });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
