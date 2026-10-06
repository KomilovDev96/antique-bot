const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({ ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'CollectorUser', required: true, index: true }, title: String, body: String, read: { type: Boolean, default: false }, target: { kind: String, id: String } }, { timestamps: true });
module.exports = mongoose.model('CollectorNotification', notificationSchema);
