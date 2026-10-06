const jwt = require('jsonwebtoken');
const CollectorUser = require('../models/CollectorUser');
const { recordActivity } = require('./activity');

module.exports = async function mobileAuth(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return res.status(401).json({ code: 'UNAUTHENTICATED', message: 'Требуется авторизация' });
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    const user = await CollectorUser.findById(payload.sub);
    if (!user) return res.status(401).json({ code: 'UNAUTHENTICATED', message: 'Пользователь не найден' });
    req.collector = user;
    recordActivity(req, user);
    next();
  } catch (error) { return res.status(401).json({ code: 'UNAUTHENTICATED', message: 'Сессия истекла' }); }
};
