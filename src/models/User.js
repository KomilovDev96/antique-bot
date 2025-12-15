// src/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  username: { type: String, default: null },
  firstName: { type: String, default: null },
  lastName: { type: String, default: null },
  role: { type: String, default: 'user' }, // admin, user
});

module.exports = mongoose.model('User', userSchema);
