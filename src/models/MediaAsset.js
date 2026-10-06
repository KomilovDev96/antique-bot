const mongoose = require('mongoose');
const mediaAssetSchema = new mongoose.Schema({ ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'CollectorUser', required: true, index: true }, url: String, kind: { type: String, default: 'image' }, filename: String, mimeType: String, size: Number }, { timestamps: true });
module.exports = mongoose.model('MediaAsset', mediaAssetSchema);
