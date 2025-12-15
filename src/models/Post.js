// src/models/Post.js
const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, default: null },
  type: { type: String, enum: ['sell', 'buy'], required: true },
  title: { type: String },
  condition: { type: String },
  price: { type: String },
  city: { type: String },
  contact: { type: String },
  description: { type: String },
  photos: { type: [String], default: [] },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'sold'], default: 'pending' },
  uniqueCode: { type: String, unique: true, sparse: true },
  channelMessageIds: { type: [String], default: [] },
}, { timestamps: true });

postSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Post', postSchema);
