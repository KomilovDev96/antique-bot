const mongoose = require('mongoose');
const itemSchema = require('./CollectionItem').schema;
const listingSchema = new mongoose.Schema({
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'CollectorUser', required: true, index: true },
  item: { type: Object, required: true }, price: { amount: String, currency: String }, priceType: { type: String, enum: ['fixed', 'negotiable'], default: 'fixed' },
  location: String, status: { type: String, enum: ['pending', 'approved', 'rejected', 'sold'], default: 'approved' },
}, { timestamps: true });
module.exports = mongoose.model('MarketplaceListing', listingSchema);
