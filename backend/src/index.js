// Dependencies
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const ethers = require('ethers'); // Import ethers for validation of Ethereum address
const feedbackRoutes = require('./routes/feedback');
const profileRoutes = require('./routes/profile');
const http = require('http');
require('dotenv').config();
const chatRoutes = require('./routes/chat');
const Message = require('./models/Message'); // Import the Message model

// Initialize Express app
const app = express();
const server = http.createServer(app);
const listEndpoints = require("express-list-endpoints");

console.log(listEndpoints(app));

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware to parse incoming JSON requests
app.use(express.json());

// --- Socket.io Chat Integration ---
const { Server } = require("socket.io");
const ioChat = new Server(server, { cors: { origin: "*" } });

ioChat.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinRoom", async (chatRoomId) => {
    socket.join(chatRoomId);
    // Fetch chat history from MongoDB
    try {
      const messages = await Message.find({ chatRoomId }).sort({ timestamp: 1 });
      socket.emit("chatHistory", messages);
    } catch (err) {
      console.error("Error fetching chat history:", err);
      socket.emit("chatHistory", []);
    }
  });

  socket.on("sendMessage", async ({ chatRoomId, sender, receiver, message }) => {
    try {
      const newMessage = new Message({
        chatRoomId,
        sender,
        receiver,
        message,
        timestamp: new Date()
      });
      await newMessage.save();
      ioChat.to(chatRoomId).emit("receiveMessage", newMessage);
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// --- Chat Rooms/Contacts API ---
// REMOVE legacy/in-memory chat endpoints and data structures
// (chatRoomsMeta, /api/chat/room, /api/chat/rooms/:wallet, and /api/chat/:roomId GET)

// MongoDB URL
const MONGODB_URL = "mongodb+srv://bscs2112159:nijla1234@cluster0.lz0v4.mongodb.net/campaigns";

// MongoDB connection
mongoose
  .connect(MONGODB_URL, { 
    serverSelectionTimeoutMS: 30000, // 30 seconds timeout
    socketTimeoutMS: 30000 // 30 seconds socket timeout
  })
  .then(() => {
    console.log('MongoDB connected successfully');
    console.log('Connected to database:', mongoose.connection.db.databaseName);
    // List all collections
    mongoose.connection.db.listCollections().toArray((err, collections) => {
      if (err) {
        console.error('Error listing collections:', err);
      } else {
        console.log('Available collections:', collections.map(c => c.name));
      }
    });
    // Drop old unique index on roomId and remove documents with roomId: null
    mongoose.connection.db.collection('chats').indexes().then(indexes => {
      const roomIdIndex = indexes.find(idx => idx.key && idx.key.roomId === 1);
      if (roomIdIndex) {
        mongoose.connection.db.collection('chats').dropIndex(roomIdIndex.name)
          .then(() => console.log('Dropped old unique index on roomId'))
          .catch(err => console.error('Error dropping old roomId index:', err));
      }
      mongoose.connection.db.collection('chats').deleteMany({ roomId: null })
        .then(result => {
          if (result.deletedCount > 0) {
            console.log('Removed documents with roomId: null');
          }
        })
        .catch(err => console.error('Error removing roomId: null docs:', err));
    });
  })
  .catch((err) => console.log('MongoDB connection failed:', err));

// // Define the schema for campaigns
// const campaignSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   campaign_title: { type: String, required: true },
//   description: { type: String, required: true },
//   goal: { type: String, required: true }, // String for large ETH values
//   deadline: { type: Date, required: true },
//   image: { type: String, required: true }, // Assuming this is needed as well
//   wallet_address: { type: String, required: true }, // Wallet address of the campaign creator
//   category: { type: String, required: true },  // Category of the campaign
//   feedbacks: [
//     {
//       comment: { type: String, required: true },
//       date: { type: Date, default: Date.now },
//     }
//   ],
// });


// const likeSchema = new mongoose.Schema({
//   wallet_id: { type: String, required: true }, // Wallet ID of the user who liked the campaign
//   campaign_id: { type: mongoose.Schema.Types.ObjectId, ref: 'schema', required: true }, // Reference to the campaign
//   created_at: { type: Date, default: Date.now }, // Timestamp for when the like was created
// });

// Create model with 'Campaign' collection
// const Campaign = mongoose.model('Campaign', campaignSchema);
// const Like = mongoose.model('Like', likeSchema);

const { Campaign, Like } = require('./schema/schema.js'); // Import the Campaign and Like models

// Helper function to validate Ethereum address
const validateEthereumAddress = (address) => {
  try {
    return ethers.utils.isAddress(address); // Returns true if the address is valid
  } catch (e) {
    return false;
  }
};

app.post('/api/like', async (req, res) => {
  console.log("Received data:", req.body); // Debugging log

  const { campaign_id, wallet_address } = req.body;

  try {
    // Check if all fields are present
    if (!campaign_id || !wallet_address) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const campaign = await Campaign.findById(campaign_id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Normalize the wallet address to lowercase to ensure case-insensitivity
    const normalizedAddress = wallet_address.toLowerCase();

    const like = await Like.find({
      campaign_id: campaign._id,
      wallet_id: normalizedAddress,
    });

    if (like.length > 0) {
      // unlike the campaign
      await Like.deleteMany({
        campaign_id: campaign._id,
        wallet_id: normalizedAddress,
      });
    } else {
      // Create a new like
      const newLike = new Like({
        campaign_id: campaign._id,
        wallet_id: normalizedAddress,
      });

      // Save the new like to the database
      await newLike.save();
    }

    const likesCount = await Like.countDocuments({ campaign_id: campaign._id });
    // Return success response
    res.status(201).json({ message: 'Campaign liked successfully', liked: like.length === 0, likes: likesCount });
  } catch (error) {
    console.error("Error liking campaign:", error); // Debugging log
    res.status(500).json({ message: 'Error liking campaign', error: error });
  }
});

// Route to handle campaign creation
app.post('/api/schema', async (req, res) => {
  console.log("Received data:", req.body); // Debugging log

  const { wallet_address } = req.body;

  try {
    // Check if all fields are present
    if (!req.body.name || !req.body.campaign_title || !req.body.description || !req.body.goal || !req.body.deadline || !req.body.image || !req.body.category) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create a new campaign
    const newCampaign = new Campaign(req.body);

    // Save the new campaign to the database
    const savedCampaign = await newCampaign.save();

    // Return success response
    res.status(201).json({ message: 'Campaign created successfully', data: savedCampaign });
  } catch (err) {
    console.error("Error creating campaign:", err); // Debugging log
    res.status(500).json({ message: 'Error creating campaign', error: err });
  }
});

// GET route to fetch campaign details by ID
app.get('/api/schema/:id', async (req, res) => {
  const { id } = req.params;
  // 1) Validate the ID is at least a 24-char hex string
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: 'Invalid campaign ID format' });
  }

  try {
    // 2) Use aggregator to find matching doc
    const campaign = await Campaign.aggregate([
      { $match: { _id: mongoose.Types.ObjectId(id) } },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'campaign_id',
          as: 'likes'
        }
      },
      {
        $project: {
          name: 1,
          campaign_title: 1,
          description: 1,
          goal: 1,
          deadline: 1,
          image: 1,
          wallet_address: 1,
          category: 1,
          likes: { $size: '$likes' }
        }
      }
    ]);

    // 3) If aggregator found no doc, 404
    if (!campaign || campaign.length === 0) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.json(campaign); // returns an array with the single campaign object
  } catch (error) {
    console.error('Error fetching campaign:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// DELETE route to remove a campaign by id
app.delete('/api/schema/:id', async (req, res) => {
  const { id } = req.params;  // Extract campaign id from URL parameters

  try {
    // Find the campaign by id and delete it
    const deletedCampaign = await Campaign.findByIdAndDelete(id);

    if (!deletedCampaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    res.status(200).json({ message: 'Campaign deleted successfully', data: deletedCampaign });
  } catch (error) {
    console.error('Error deleting campaign:', error);
    res.status(500).json({ message: 'Error deleting campaign', error: error });
  }
});


// GET route to fetch campaigns
app.get('/api/schema', async (req, res) => {
  const { wallet_address } = req.query;  // Extract wallet address from query params
  console.log("Received wallet address in query:", wallet_address);  // Log the wallet address for debugging

  try {
    if (wallet_address) {
      // Normalize the wallet address to lowercase to ensure case-insensitivity
      const normalizedAddress = wallet_address.toLowerCase();

      // Validate Ethereum address if provided
      // if (!validateEthereumAddress(normalizedAddress)) {
      //   return res.status(400).json({ message: 'Invalid Ethereum address' });
      // }

      // If wallet_address is provided, fetch campaigns created by that wallet
      const userCampaigns = await Campaign.aggregate([
        { $match: { wallet_address: normalizedAddress } },
        {
          $lookup: {
            from: 'likes', // The collection name in MongoDB
            localField: '_id',
            foreignField: 'campaign_id', // Assuming 'campaign_id' is the field in Like model that references Campaign
            as: 'likes'
          }
        },
        {
          $project: {
            likes: { $size: '$likes' }
          }
        }
      ]);

      if (userCampaigns.length === 0) {
        return res.status(404).json({ message: 'No campaigns found for this wallet address' });
      }

      // Return campaigns associated with the wallet address
      return res.json({ data: userCampaigns });
    }

    // If no wallet_address is provided, fetch all campaigns
    const allCampaigns = await Campaign.aggregate([
      {
        $lookup: {
          from: 'likes', // The collection name in MongoDB
          localField: '_id',
          foreignField: 'campaign_id', // Assuming 'campaign_id' is the field in Like model that references Campaign
          as: 'likes'
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          campaign_title: 1,
          description: 1,
          goal: 1,
          deadline: 1,
          image: 1,
          wallet_address: 1,
          category: 1,
          likes: { $size: '$likes' }
        }
      },
      {
        $sort: { likes: -1 }
      }
    ]); // Sort by likes in descending order

    return res.json({ data: allCampaigns });
  } catch (error) {
    console.error("Error fetching campaigns:", error);  // Log error for debugging
    res.status(500).json({ message: 'Server Error', error: error });
  }
});

// POST route to like a campaign (increment the likes field)
app.post('/api/like/:id', async (req, res) => {
  const { id } = req.params; // Campaign ID
  try {
    // Find the campaign by ID and increment the likes field
    const updatedCampaign = await Campaign.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } }, // Increment the likes by 1
      { new: true } // Return the updated document
    );

    if (!updatedCampaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }

    // Return the updated campaign
    res.json({ message: 'Campaign liked successfully', data: updatedCampaign });
  } catch (error) {
    console.error('Error liking campaign:', error);
    res.status(500).json({ message: 'Error liking campaign', error: error });
  }
});

app.get("/api/search", async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) return res.json([]);

    // Case-insensitive search for campaign title
    const campaigns = await Campaign.find({
      campaign_title: { $regex: query, $options: "i" },
    });

    res.json(campaigns);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/campaign/:pId", async (req, res) => {
  try {
    const { pId } = req.params;

    // ✅ Convert ID to ObjectId
    if (!mongoose.Types.ObjectId.isValid(pId)) {
      return res.status(400).json({ error: "Invalid campaign ID format" });
    }

    console.log("🔎 Searching for Campaign with ID:", pId); // Debugging Log

    const campaign = await Campaign.findOne({ _id: new mongoose.Types.ObjectId(pId) });

    if (!campaign) {
      console.log("❌ Campaign not found");
      return res.status(404).json({ error: "Campaign not found" });
    }

    console.log("✅ Campaign found:", campaign);
    res.json({ walletAddress: campaign.wallet_address });
  } catch (error) {
    console.error("❌ Error fetching campaign:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add endpoint to update blockchainIndex for a campaign
app.post('/api/updateCampaignBlockchainIndex', async (req, res) => {
  const { _id, blockchainIndex } = req.body;
  if (!_id || blockchainIndex === undefined) {
    return res.status(400).json({ message: '_id and blockchainIndex are required' });
  }
  try {
    const updated = await Campaign.findByIdAndUpdate(
      _id,
      { $set: { blockchainIndex } },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    res.status(200).json({ message: 'blockchainIndex updated', data: updated });
  } catch (err) {
    console.error('Error updating blockchainIndex:', err);
    res.status(500).json({ message: 'Error updating blockchainIndex', error: err });
  }
});



// Register routes before error handlers
app.use('/api/feedback', feedbackRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/chat', chatRoutes);


app.get("/api/get-wallet/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid campaign ID format" });
  }

  try {
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    res.status(200).json({ walletAddress: campaign.wallet_address });
  } catch (error) {
    console.error("Error fetching wallet address:", error);
    res.status(500).json({ error: "Server error" });
  }
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested resource was not found'
  });
});

// Start the server
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server (API + Socket.io) running on port ${PORT}`);
});
