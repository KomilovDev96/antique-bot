// src/models/Order.js
const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  username: String,
  itemName: String,
  description: String,
  photoPath: String,
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "completed"],
    default: "pending"
  },
  createdAt: { type: Date, default: Date.now },
  contact: String,
});

orderSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model("Order", orderSchema);
