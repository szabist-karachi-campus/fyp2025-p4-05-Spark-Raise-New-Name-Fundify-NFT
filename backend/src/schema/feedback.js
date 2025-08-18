const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    campaignId: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    feedback: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 1000
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, { 
    collection: 'feedbacks',
    timestamps: true 
});

// Create compound index for faster queries
feedbackSchema.index({ campaignId: 1, timestamp: -1 });

const FeedbackModel = mongoose.model('Feedback', feedbackSchema);

// Ensure indexes are created
FeedbackModel.createIndexes().then(() => {
    console.log('Feedback indexes created successfully');
}).catch(err => {
    console.error('Error creating feedback indexes:', err);
});

module.exports = FeedbackModel; 