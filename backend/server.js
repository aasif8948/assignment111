const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/leaderboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const User = require('./models/User');
const ClaimHistory = require('./models/ClaimHistory');

// Get all users sorted by totalPoints (leaderboard)
app.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ totalPoints: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Add a new user
app.post('/users', async (req, res) => {
  try {
    const { name, profilePicture } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const user = new User({ name, profilePicture });
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add user' });
  }
});

// Claim random points for a user
app.post('/claim', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const points = Math.floor(Math.random() * 10) + 1;
    user.totalPoints += points;
    await user.save();
    const claim = new ClaimHistory({ user: user._id, points });
    await claim.save();
    res.json({ user, points });
  } catch (err) {
    res.status(500).json({ error: 'Failed to claim points' });
  }
});

// Get claim history (most recent first)
app.get('/history', async (req, res) => {
  try {
    const history = await ClaimHistory.find().populate('user', 'name profilePicture').sort({ claimedAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 