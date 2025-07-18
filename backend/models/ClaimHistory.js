const mongoose = require('mongoose');

const claimHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  points: { type: Number, required: true },
  claimedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ClaimHistory', claimHistorySchema); 