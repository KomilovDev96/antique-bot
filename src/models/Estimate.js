const mongoose = require('mongoose');

const estimateSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, default: null },
  photos: { type: [String], required: true },
  description: { type: String },
  adminReply: { type: String, default: null },
  status: { type: String, enum: ['pending', 'replied'], default: 'pending' },
}, { timestamps: true });

estimateSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Estimate', estimateSchema);
