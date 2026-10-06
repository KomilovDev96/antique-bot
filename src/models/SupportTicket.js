const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'CollectorUser', required: true, index: true },
  subject: { type: String, required: true, trim: true, maxlength: 160 },
  phone: { type: String, required: true, trim: true, maxlength: 30 },
  status: { type: String, enum: ['open', 'waiting_user', 'waiting_admin', 'closed'], default: 'waiting_admin', index: true },
  lastMessage: { type: String, default: '' },
  lastMessageAt: { type: Date, default: Date.now, index: true },
  unreadForAdmin: { type: Number, default: 1 },
  unreadForUser: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
