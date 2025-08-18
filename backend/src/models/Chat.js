const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  chatRoomId: {
    type: String,
    required: true,
    unique: true
  },
  users: [{
    type: String,
    required: true
  }],
  label: {
    type: String,
    required: true
  },
  createdBy: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Chat', chatSchema); 