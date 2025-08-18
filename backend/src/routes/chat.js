const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const axios = require('axios');

// POST /api/chat/create - Create a chat room if it doesn't exist
router.post('/create', async (req, res) => {
  let { label, walletA, walletB, createdBy } = req.body;
  walletA = walletA.toLowerCase();
  walletB = walletB.toLowerCase();
  createdBy = createdBy.toLowerCase();
  if (!label || !walletA || !walletB || !createdBy) {
    return res.status(400).json({ message: 'label, walletA, walletB, and createdBy are required' });
  }
  try {
    const sortedWallets = [walletA, walletB].sort();
    const chatRoomId = `room_${sortedWallets[0]}_${sortedWallets[1]}`;
    let chat = await Chat.findOne({ chatRoomId });
    if (!chat) {
      chat = new Chat({
        chatRoomId,
        users: sortedWallets,
        label,
        createdBy,
        createdAt: new Date()
        });
      await chat.save();
      }
    res.status(201).json({ message: 'Chat room created or already exists', chatRoomId });
  } catch (err) {
    console.error('Error creating chat room:', err);
    res.status(500).json({ message: 'Failed to create chat room' });
  }
});

// GET /api/chat/rooms/:wallet - Get all chat rooms for a wallet
router.get('/rooms/:wallet', async (req, res) => {
  const wallet = req.params.wallet.toLowerCase();
  try {
    const chats = await Chat.find({ users: wallet });
    res.json({ chats });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch chat rooms' });
  }
});

module.exports = router; 