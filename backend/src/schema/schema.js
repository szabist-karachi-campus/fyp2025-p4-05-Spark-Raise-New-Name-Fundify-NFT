const mongoose = require('mongoose');

// export const campaignSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   campaign_title: { type: String, required: true },
//   campaignId: { type: String, required: true },
//   description: { type: String, required: true }, // Fixed typo from 'Strisng' to 'String'
//   goal: { type: String, required: true },
//   deadline: { type: Date, required: true },
//   image: { type: String, required: true }, // Assuming this is needed as well
//   category: { type: String, required: true }, // New category field
//   wallet_address: { type: String, required: true }, // New wallet address field
//   likes: { type: Number, default: 0 }, // New likes field with default value 0
//   feedback: [
//     {
     
//       comment: String,
//       date: { type: Date, default: Date.now },
//     },
//   ],
// });

// // Make sure collection name is set to 'schema'
// const Campaign = mongoose.model('schema', campaignSchema);

// const likeSchema = new mongoose.Schema({
//   wallet_id: { type: String, required: true }, // Wallet ID of the user who liked the campaign
//   campaign_id: { type: mongoose.Schema.Types.ObjectId, ref: 'schema', required: true }, // Reference to the campaign
//   created_at: { type: Date, default: Date.now }, // Timestamp for when the like was created
// });

// // Set the collection name to 'likes'
// const Like = mongoose.model('like', likeSchema);


// module.exports = { Campaign, Like };

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  campaign_title: { type: String, required: true },
  // Remove the separate "campaignId" if you're actually matching by _id in Mongo
  description: { type: String, required: true },
  goal: { type: String, required: true },
  deadline: { type: Date, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  wallet_address: { type: String, required: true },
  likes: { type: Number, default: 0 },
  feedback: [
    {
      comment: String,
      date: { type: Date, default: Date.now },
    },
  ],
  blockchainIndex: { type: Number },
});

const Campaign = mongoose.model('Campaign', campaignSchema);
// Mongoose will put these docs into the "campaigns" collection

const likeSchema = new mongoose.Schema({
  wallet_id: { type: String, required: true },
  campaign_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  created_at: { type: Date, default: Date.now },
});
const Like = mongoose.model('Like', likeSchema);
// Mongoose will put these docs into the "likes" collection

const userProfileSchema = new mongoose.Schema({
  wallet: { type: String, required: true, unique: true },
  name: { type: String, default: '' },
  bio: { type: String, default: '' },
});
const UserProfile = mongoose.model('UserProfile', userProfileSchema);

module.exports = { Campaign, Like, UserProfile };

