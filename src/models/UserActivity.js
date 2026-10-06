const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'CollectorUser', required: true, index: true },
  event: { type: String, required: true, index: true },
  feature: { type: String, required: true, index: true },
  method: { type: String, default: null },
  path: { type: String, default: null },
  ip: { type: String, default: null, index: true },
  userAgent: { type: String, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: null },
  createdAt: { type: Date, default: Date.now, index: true },
}, { versionKey: false });

userActivitySchema.index({ createdAt: -1, feature: 1 });
userActivitySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('UserActivity', userActivitySchema);
