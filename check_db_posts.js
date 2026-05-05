const mongoose = require('mongoose');
require('dotenv').config();
const Post = require('./models/Post');

async function checkPosts() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const posts = await Post.find().select('title createdAt');
        console.log('--- Current Posts in Database ---');
        if (posts.length === 0) {
            console.log('No posts found.');
        } else {
            posts.forEach(p => console.log(`- ${p.title} (Created: ${p.createdAt})`));
        }
        await mongoose.connection.close();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkPosts();
