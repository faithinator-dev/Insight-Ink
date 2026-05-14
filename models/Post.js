const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  author: { type: String, required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, default: Date.now },
  replies: [{
    text: String,
    author: String,
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
  }]
});

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: { type: String, required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  slug: {
    type: String,
    unique: true
  },
  excerpt: {
    type: String,
    maxlength: 160,
  },
  content: {
    type: String,
    required: true,
  },
  imageData: {
    type: String, // Base64 encoded image
    default: null,
  },
  readTime: {
    type: Number,
    default: 5
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [CommentSchema]
}, { timestamps: true });

// Create post slug from the title
PostSchema.pre('save', async function() {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .split(' ')
      .join('-')
      .replace(/[^\w-]+/g, '');
  }
});

module.exports = mongoose.model('Post', PostSchema);
