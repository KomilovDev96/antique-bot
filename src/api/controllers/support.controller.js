const SupportTicket = require('../../models/SupportTicket');
const SupportMessage = require('../../models/SupportMessage');
const CollectorUser = require('../../models/CollectorUser');
const Notification = require('../../models/Notification');

const clean = value => String(value || '').trim();
const validPhone = value => /^\+?[0-9()\s-]{7,30}$/.test(value);
const serializeMessage = value => ({ id: String(value._id), ticketId: String(value.ticketId), senderRole: value.senderRole, senderId: value.senderId, text: value.text, createdAt: value.createdAt.toISOString() });
const serializeTicket = value => ({ id: String(value._id), subject: value.subject, phone: value.phone, status: value.status, lastMessage: value.lastMessage, lastMessageAt: value.lastMessageAt.toISOString(), unreadForAdmin: value.unreadForAdmin, unreadForUser: value.unreadForUser, owner: value.ownerId && typeof value.ownerId === 'object' ? { id: String(value.ownerId._id), name: value.ownerId.name, email: value.ownerId.email } : undefined });

exports.list = async (req, res) => {
  try {
    const filter = { ownerId: req.collector._id };
    const items = await SupportTicket.find(filter).sort({ lastMessageAt: -1 }).limit(50);
    res.json({ items: items.map(serializeTicket), nextCursor: null, total: items.length });
  } catch (error) { res.status(500).json({ code: 'SUPPORT_LOAD_FAILED', message: 'Не удалось загрузить обращения' }); }
};

exports.create = async (req, res) => {
  try {
    const subject = clean(req.body?.subject).slice(0, 160);
    const phone = clean(req.body?.phone).slice(0, 30);
    const text = clean(req.body?.message).slice(0, 5000);
    if (subject.length < 3 || text.length < 1 || !validPhone(phone)) return res.status(400).json({ code: 'INVALID_SUPPORT_MESSAGE', message: 'Укажите тему, корректный номер телефона и сообщение' });
    const ticket = await SupportTicket.create({ ownerId: req.collector._id, subject, phone, lastMessage: text, status: 'waiting_admin', unreadForAdmin: 1 });
    const message = await SupportMessage.create({ ticketId: ticket._id, senderRole: 'user', senderId: String(req.collector._id), text, readByAdmin: false, readByUser: true });
    res.status(201).json({ ticket: serializeTicket(ticket), message: serializeMessage(message) });
  } catch (error) { res.status(500).json({ code: 'SUPPORT_CREATE_FAILED', message: 'Не удалось создать обращение' }); }
};

exports.messages = async (req, res) => {
  try {
    const ticket = await SupportTicket.findOne({ _id: req.params.id, ownerId: req.collector._id });
    if (!ticket) return res.status(404).json({ code: 'NOT_FOUND', message: 'Обращение не найдено' });
    await SupportMessage.updateMany({ ticketId: ticket._id, senderRole: 'admin' }, { $set: { readByUser: true } });
    ticket.unreadForUser = 0; await ticket.save();
    const messages = await SupportMessage.find({ ticketId: ticket._id }).sort({ createdAt: 1 });
    res.json({ ticket: serializeTicket(ticket), items: messages.map(serializeMessage) });
  } catch (error) { res.status(500).json({ code: 'SUPPORT_MESSAGES_FAILED', message: 'Не удалось загрузить переписку' }); }
};

exports.reply = async (req, res) => {
  try {
    const ticket = await SupportTicket.findOne({ _id: req.params.id, ownerId: req.collector._id });
    const text = clean(req.body?.message).slice(0, 5000);
    if (!ticket) return res.status(404).json({ code: 'NOT_FOUND', message: 'Обращение не найдено' });
    if (!text) return res.status(400).json({ code: 'INVALID_SUPPORT_MESSAGE', message: 'Введите сообщение' });
    const message = await SupportMessage.create({ ticketId: ticket._id, senderRole: 'user', senderId: String(req.collector._id), text, readByAdmin: false, readByUser: true });
    ticket.lastMessage = text; ticket.lastMessageAt = new Date(); ticket.status = 'waiting_admin'; ticket.unreadForAdmin = (ticket.unreadForAdmin || 0) + 1; await ticket.save();
    res.status(201).json({ ticket: serializeTicket(ticket), message: serializeMessage(message) });
  } catch (error) { res.status(500).json({ code: 'SUPPORT_REPLY_FAILED', message: 'Не удалось отправить сообщение' }); }
};

exports.adminList = async (req, res) => {
  try {
    const status = req.query.status && req.query.status !== 'all' ? req.query.status : undefined;
    const filter = status ? { status } : {};
    const items = await SupportTicket.find(filter).populate('ownerId', 'name email').sort({ lastMessageAt: -1 }).limit(100);
    res.json({ items: items.map(serializeTicket), total: items.length });
  } catch (error) { res.status(500).json({ message: 'Failed to load support tickets' }); }
};

exports.adminUnreadCount = async (_req, res) => {
  try { res.json({ count: await SupportMessage.countDocuments({ senderRole: 'user', readByAdmin: false }) }); }
  catch (error) { res.status(500).json({ message: 'Failed to load support notifications' }); }
};

exports.adminMessages = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id).populate('ownerId', 'name email');
    if (!ticket) return res.status(404).json({ message: 'Support ticket not found' });
    await SupportMessage.updateMany({ ticketId: ticket._id, senderRole: 'user' }, { $set: { readByAdmin: true } });
    ticket.unreadForAdmin = 0; await ticket.save();
    const messages = await SupportMessage.find({ ticketId: ticket._id }).sort({ createdAt: 1 });
    res.json({ ticket: serializeTicket(ticket), items: messages.map(serializeMessage) });
  } catch (error) { res.status(500).json({ message: 'Failed to load support messages' }); }
};

exports.adminReply = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    const text = clean(req.body?.message).slice(0, 5000);
    if (!ticket) return res.status(404).json({ message: 'Support ticket not found' });
    if (!text) return res.status(400).json({ message: 'Message is required' });
    const message = await SupportMessage.create({ ticketId: ticket._id, senderRole: 'admin', senderId: String(req.user.username || 'admin'), text, readByAdmin: true, readByUser: false });
    ticket.lastMessage = text; ticket.lastMessageAt = new Date(); ticket.status = 'waiting_user'; ticket.unreadForAdmin = 0; ticket.unreadForUser = (ticket.unreadForUser || 0) + 1; await ticket.save();
    await Notification.create({ ownerId: ticket.ownerId, title: 'Ответ службы поддержки', body: text.slice(0, 180), target: { kind: 'support', id: String(ticket._id) } });
    res.status(201).json({ ticket: serializeTicket(ticket), message: serializeMessage(message) });
  } catch (error) { res.status(500).json({ message: 'Failed to send support reply' }); }
};

exports.adminStatus = async (req, res) => {
  try {
    const status = String(req.body?.status || '');
    if (!['open', 'waiting_user', 'waiting_admin', 'closed'].includes(status)) return res.status(400).json({ message: 'Invalid support status' });
    const ticket = await SupportTicket.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('ownerId', 'name email');
    if (!ticket) return res.status(404).json({ message: 'Support ticket not found' });
    res.json(serializeTicket(ticket));
  } catch (error) { res.status(500).json({ message: 'Failed to update support status' }); }
};
