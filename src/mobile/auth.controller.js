const jwt = require('jsonwebtoken');
const CollectorUser = require('../models/CollectorUser');
const { hashPassword, verifyPassword, hashToken, createToken } = require('./crypto');
const { user } = require('./format');
const { recordLogin, recordActivity } = require('./activity');

const access = (record) => jwt.sign({ sub: String(record._id), role: 'collector', email: record.email }, process.env.JWT_SECRET, { expiresIn: process.env.MOBILE_ACCESS_TTL || '30m' });
const session = async (record) => {
  const refreshToken = createToken();
  record.refreshTokens = (record.refreshTokens || []).filter(token => new Date(token.expiresAt) > new Date()).concat({ hash: hashToken(refreshToken), expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }).slice(-5);
  await record.save();
  return { accessToken: access(record), refreshToken, user: user(record) };
};
const validEmail = (value) => /^[^\s@]+@(?:gmail\.com|googlemail\.com)$/i.test(value);

exports.register = async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase(); const password = String(req.body?.password || '');
  if (!validEmail(email)) return res.status(400).json({ code: 'INVALID_EMAIL', message: 'Используйте адрес Gmail' });
  if (password.length < 12 || password.length > 128) return res.status(400).json({ code: 'INVALID_PASSWORD', message: 'Пароль должен содержать от 12 до 128 символов' });
  if (await CollectorUser.exists({ email })) return res.status(409).json({ code: 'EMAIL_TAKEN', message: 'Этот email уже зарегистрирован' });
  const record = await CollectorUser.create({ email, passwordHash: await hashPassword(password), name: String(req.body?.name || 'Коллекционер').trim() || 'Коллекционер', emailVerified: true });
  const result = await session(record); recordLogin(req, record);
  return res.status(201).json(result);
};
exports.login = async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase(); const password = String(req.body?.password || '');
  const record = await CollectorUser.findOne({ email }).select('+passwordHash');
  if (!record || !(await verifyPassword(password, record.passwordHash))) return res.status(401).json({ code: 'INVALID_CREDENTIALS', message: 'Неверный email или пароль' });
  const result = await session(record); recordLogin(req, record);
  return res.json(result);
};
exports.refresh = async (req, res) => {
  const token = String(req.body?.refreshToken || ''); const digest = hashToken(token);
  const record = await CollectorUser.findOne({ 'refreshTokens.hash': digest });
  if (!record) return res.status(401).json({ code: 'INVALID_REFRESH_TOKEN', message: 'Сессия истекла' });
  record.refreshTokens = record.refreshTokens.filter(value => value.hash !== digest);
  const result = await session(record); recordActivity(req, record, 'refresh');
  return res.json(result);
};
exports.logout = async (req, res) => {
  const digest = hashToken(String(req.body?.refreshToken || ''));
  req.collector.refreshTokens = (req.collector.refreshTokens || []).filter(value => value.hash !== digest); await req.collector.save();
  return res.json({ success: true });
};
exports.me = (req, res) => res.json({ user: user(req.collector) });
exports.profile = async (req, res) => { const allowed = ['name', 'avatarUrl', 'categoryIds']; for (const key of allowed) if (req.body?.[key] !== undefined) req.collector[key] = req.body[key]; await req.collector.save(); res.json(user(req.collector)); };
