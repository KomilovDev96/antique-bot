const mongoose = require('mongoose');

const marketplaceMessageSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'MarketplaceListing', required: true, index: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'CollectorUser', required: true },
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'CollectorUser', required: true },
  text: { type: String, required: true, trim: true, maxlength: 2000 },
  read: { type: Boolean, default: false },
}, { timestamps: true });

marketplaceMessageSchema.index({ listingId: 1, createdAt: 1 });
module.exports = mongoose.model('MarketplaceMessage', marketplaceMessageSchema);
