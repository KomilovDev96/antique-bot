const mongoose = require('mongoose');

const rulerSchema = new mongoose.Schema({
  slug: { type: String, required: true },
  name: { type: String, required: true },
  years: String,
  portraitUrl: String,
}, { _id: false });

const denominationSchema = new mongoose.Schema({
  slug: { type: String, required: true },
  label: { type: String, required: true },
  metal: String,
}, { _id: false });

const coinSchema = new mongoose.Schema({
  slug: { type: String, required: true },
  title: { type: String, required: true },
  ruler: { type: String, required: true },
  denomination: { type: String, required: true },
  year: String,
  mint: String,
  metal: String,
  weight: String,
  diameter: String,
  mintage: String,
  grade: String,
  description: String,
  imageUrl: String,
  imageUrls: { type: [String], default: [] },
  price: { amount: String, currency: String },
}, { _id: false });

const coinCatalogSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  subtitle: String,
  period: String,
  country: String,
  coverUrl: String,
  rulers: { type: [rulerSchema], default: [] },
  denominations: { type: [denominationSchema], default: [] },
  coins: { type: [coinSchema], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('CoinCatalog', coinCatalogSchema);
