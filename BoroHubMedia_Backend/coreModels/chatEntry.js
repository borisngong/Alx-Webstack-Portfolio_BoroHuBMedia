const mongoose = require('mongoose');

const chatEntrySchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat' },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' },
    content: { type: String, required: true },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatEntry',
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('chatEntry', chatEntrySchema);
