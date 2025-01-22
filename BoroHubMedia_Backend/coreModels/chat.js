const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Member' }],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },

    messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'chatEntry' }],
  },
  { timestamps: true },
);

module.exports = mongoose.model('Chat', chatSchema);
