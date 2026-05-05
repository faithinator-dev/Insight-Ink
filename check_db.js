require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('./models/Post');
const connectDB = require('./config/db');

async function check() {
    await connectDB();
    const posts = await Post.find();
    console.log('Total posts found:', posts.length);
    posts.forEach(p => {
        console.log(`ID: ${p._id}, Title: ${p.title}, Slug: ${p.slug}`);
    });
    process.exit();
}

check();
