const mongoose = require('mongoose');

const savedSearchSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'CollectorUser', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  filters: { type: Map, of: mongoose.Schema.Types.Mixed, default: {} },
  alertsEnabled: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('SavedSearch', savedSearchSchema);
