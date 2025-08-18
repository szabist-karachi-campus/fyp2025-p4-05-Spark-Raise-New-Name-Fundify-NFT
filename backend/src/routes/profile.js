const express = require('express');
const router = express.Router();
const { UserProfile } = require('../schema/schema');

// Get user profile by wallet address
router.get('/:wallet', async (req, res) => {
  try {
    const { wallet } = req.params;
    const profile = await UserProfile.findOne({ wallet: wallet.toLowerCase() });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create or update user profile
router.post('/', async (req, res) => {
  try {
    const { wallet, name, bio } = req.body;
    if (!wallet) {
      return res.status(400).json({ message: 'Wallet address is required' });
    }
    const updated = await UserProfile.findOneAndUpdate(
      { wallet: wallet.toLowerCase() },
      { name, bio },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 