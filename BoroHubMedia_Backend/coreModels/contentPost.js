const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    content: {
      type: String,
      trim: true,
      required: true,
    },
    media: [
      {
        type: String,
        default: [],
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    likeCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

// Create the model for the Post schema
const Post = mongoose.model('Post', postSchema);

module.exports = Post;
