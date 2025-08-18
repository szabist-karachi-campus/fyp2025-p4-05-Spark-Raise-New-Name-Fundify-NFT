const express = require('express');
const router = express.Router();
const Feedback = require('../schema/feedback');
const mongoose = require('mongoose');

// POST endpoint to submit feedback
router.post('/', async (req, res) => {
    try {
        const { walletAddress, campaignId, feedback } = req.body;

        // Basic validation
        if (!walletAddress || !campaignId || !feedback) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate feedback length
        if (feedback.length < 1 || feedback.length > 1000) {
            return res.status(400).json({ error: 'Feedback must be between 1 and 1000 characters' });
        }

        // Check if feedback already exists for this user and campaign
        const existingFeedback = await Feedback.findOne({
            walletAddress: walletAddress.toLowerCase(),
            campaignId: campaignId.trim()
        });

        if (existingFeedback) {
            return res.status(400).json({ error: 'You have already submitted feedback for this campaign' });
        }

        // Create new feedback
        const newFeedback = new Feedback({
            walletAddress: walletAddress.toLowerCase(),
            campaignId: campaignId.trim(),
            feedback: feedback.trim()
        });

        // Save to database
        const savedFeedback = await newFeedback.save();

        res.status(201).json({ 
            message: 'Feedback submitted successfully', 
            data: savedFeedback 
        });
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({ error: 'Error submitting feedback' });
    }
});

// GET endpoint to fetch feedback for a specific campaign
router.get('/:campaignId', async (req, res) => {
    try {
        const { campaignId } = req.params;
        
        if (!campaignId) {
            return res.status(400).json({ error: 'Campaign ID is required' });
        }

        // Set cache control headers for better performance
        res.set('Cache-Control', 'no-cache');
        res.set('Pragma', 'no-cache');
        res.set('Expires', '0');

        const feedbacks = await Feedback.find({ campaignId: campaignId.trim() })
            .sort({ timestamp: -1 }) // Sort by newest first
            .select('feedback walletAddress timestamp') // Only select needed fields
            .lean() // Use lean() for better performance
            .exec();

        res.json({ 
            success: true,
            data: feedbacks,
            count: feedbacks.length,
            timestamp: new Date()
        });
    } catch (error) {
        console.error('Error fetching feedback:', error);
        res.status(500).json({ error: 'Error fetching feedback' });
    }
});

module.exports = router; 