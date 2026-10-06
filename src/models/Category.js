const mongoose = require('mongoose');

const attributeSchema = new mongoose.Schema({
  key: String, label: String, type: { type: String, enum: ['text', 'number', 'select'], default: 'text' },
  unit: String, required: { type: Boolean, default: false }, options: [String],
}, { _id: false });

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true }, slug: { type: String, required: true, unique: true },
  parentId: { type: String, default: null }, attributes: { type: [attributeSchema], default: [] },
  metal: { type: String, enum: ['gold', 'silver', null], default: null },
}, { timestamps: true });

module.exports = mongoose.model('MobileCategory', categorySchema);
