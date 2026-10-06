const mongoose = require('mongoose');

const refreshSchema = new mongoose.Schema({
  hash: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
}, { _id: false });

const collectorUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  passwordHash: { type: String, required: true, select: false },
  name: { type: String, default: 'Коллекционер', trim: true, maxlength: 80 },
  phone: { type: String, default: null, trim: true, maxlength: 30 },
  phoneVerified: { type: Boolean, default: false },
  identityVerified: { type: Boolean, default: false },
  avatarUrl: { type: String, default: null },
  categoryIds: { type: [String], default: [] },
  telegramId: { type: String, default: null, index: true },
  telegramUsername: { type: String, default: null },
  emailVerified: { type: Boolean, default: true },
  lastLoginAt: { type: Date, default: null, index: true },
  lastLoginIp: { type: String, default: null },
  lastLoginUserAgent: { type: String, default: null },
  lastSeenAt: { type: Date, default: null, index: true },
  lastSeenIp: { type: String, default: null },
  lastSeenUserAgent: { type: String, default: null },
  loginCount: { type: Number, default: 0 },
  refreshTokens: { type: [refreshSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('CollectorUser', collectorUserSchema);
