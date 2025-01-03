const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const memberSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    handle: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    emailAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    role: { type: String, enum: ["member", "admin"], default: "member" },
    aboutMe: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    location: {
      type: String,
      trim: true,
    },
    Hobby: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    coverImage: {
      type: String,
      default: "",
    },
    connections: {
      followers: [
        {
          type: Schema.Types.ObjectId,
          ref: "Member",
        },
      ],
      following: [
        {
          type: Schema.Types.ObjectId,
          ref: "Member",
        },
      ],
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    restrictedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Member",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// This Creates the model for the Member schema
const Member = model("Member", memberSchema);

module.exports = Member;
