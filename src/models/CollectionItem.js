const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({ id: String, url: String, kind: { type: String, default: 'image' } }, { _id: false });
const sourceSchema = new mongoose.Schema({ title: String, url: String, domain: String, description: String, publishedAt: String }, { _id: false });

const collectionItemSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'CollectorUser', required: true, index: true },
  collectionCode: String, title: { type: String, required: true, maxlength: 240 }, categoryId: { type: String, required: true }, categoryName: { type: String, default: 'Без категории' },
  photos: { type: [mediaSchema], default: [] }, year: String, country: String, material: String, condition: String, rarity: String,
  description: String, history: String, provenance: String, notes: String, purchaseInfo: String, attributes: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  favorite: { type: Boolean, default: false }, estimatedValue: { amount: String, currency: String }, metalValue: { amount: String, currency: String },
  sources: { type: [sourceSchema], default: [] }, aiSummary: String,
}, { timestamps: true });
collectionItemSchema.index({ ownerId: 1, createdAt: -1 });
module.exports = mongoose.model('CollectionItem', collectionItemSchema);
