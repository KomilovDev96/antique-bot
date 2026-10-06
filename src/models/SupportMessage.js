const mongoose = require('mongoose');

const supportMessageSchema = new mongoose.Schema({
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportTicket', required: true, index: true },
  senderRole: { type: String, enum: ['user', 'admin'], required: true },
  senderId: { type: String, required: true },
  text: { type: String, required: true, trim: true, maxlength: 5000 },
  readByAdmin: { type: Boolean, default: false },
  readByUser: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('SupportMessage', supportMessageSchema);
