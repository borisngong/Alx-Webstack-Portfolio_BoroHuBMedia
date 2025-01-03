const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true,
  },
  input: {
    type: String,
    required: true,
    trim: true,
  },
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Member",
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const commentSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    contentPost: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    input: {
      type: String,
      required: true,
      trim: true,
    },
    likes: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Member",
      default: [],
    },
    replies: {
      type: [replySchema],
      default: [],
    },
  },
  { timestamps: true }
);

// Create the model for the Comment schema
const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
