const mongoose = require('mongoose');
const assistantMessageSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'CollectorUser', required: true, index: true },
  role: { type: String, enum: ['user', 'assistant'], required: true }, text: { type: String, required: true }, itemIds: { type: [String], default: [] }, sources: { type: Array, default: [] },
}, { timestamps: true });
assistantMessageSchema.index({ ownerId: 1, createdAt: -1 });
module.exports = mongoose.model('AssistantMessage', assistantMessageSchema);
