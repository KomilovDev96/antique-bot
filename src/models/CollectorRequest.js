const mongoose = require('mongoose');
const collectorRequestSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'CollectorUser', required: true, index: true },
  kind: { type: String, enum: ['purchase', 'sale', 'inspection', 'buy'], required: true }, title: { type: String, required: true }, description: String,
  itemId: String, listingId: String, budget: { amount: String, currency: String }, mediaIds: [String], attributes: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  status: { type: String, enum: ['pending', 'received', 'in_review', 'needs_information', 'verified', 'approved', 'rejected', 'completed'], default: 'pending' },
  history: [{ status: String, at: Date, note: String }], inspectionResult: { examiner: String, conclusion: String, issuedAt: Date, documents: [{ id: String, url: String, kind: String }] },
}, { timestamps: true });
module.exports = mongoose.model('CollectorRequest', collectorRequestSchema);
