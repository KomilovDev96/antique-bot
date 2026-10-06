const mongoose = require('mongoose');
const telegramLinkCodeSchema = new mongoose.Schema({ telegramId: { type: String, required: true, index: true }, username: String, code: { type: String, required: true, unique: true }, expiresAt: { type: Date, required: true }, usedAt: Date }, { timestamps: true });
telegramLinkCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
module.exports = mongoose.model('TelegramLinkCode', telegramLinkCodeSchema);
