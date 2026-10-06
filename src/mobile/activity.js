const CollectorUser = require('../models/CollectorUser');
const UserActivity = require('../models/UserActivity');

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const raw = forwarded ? String(forwarded).split(',')[0].trim() : req.socket?.remoteAddress;
  return raw?.startsWith('::ffff:') ? raw.slice(7) : raw || null;
}

function featureFromPath(pathname = '') {
  const value = String(pathname).toLowerCase();
  if (value.includes('/identifications')) return 'ai_identification';
  if (value.includes('/assistant')) return 'ai_assistant';
  if (value.includes('/marketplace')) return 'marketplace';
  if (value.includes('/coin-catalogs') || value.includes('/catalog')) return 'catalog';
  if (value.includes('/collection')) return 'collection';
  if (value.includes('/requests')) return 'requests';
  if (value.includes('/support')) return 'support';
  if (value.includes('/notifications')) return 'notifications';
  if (value.includes('/saved-searches')) return 'saved_searches';
  if (value.includes('/profile')) return 'profile';
  if (value.includes('/auth')) return 'auth';
  return 'other';
}

function requestContext(req) {
  const pathname = req.originalUrl?.split('?')[0] || req.path || '';
  return {
    ip: clientIp(req),
    userAgent: String(req.headers['user-agent'] || '').slice(0, 500) || null,
    method: req.method,
    path: pathname.slice(0, 300),
    feature: featureFromPath(pathname),
  };
}

function recordActivity(req, user, event = 'request', metadata = null) {
  const context = requestContext(req);
  const userId = user?._id || user?.id || user;
  if (!userId) return;
  Promise.all([
    UserActivity.create({ userId, event, feature: context.feature, method: context.method, path: context.path, ip: context.ip, userAgent: context.userAgent, metadata }),
    CollectorUser.updateOne({ _id: userId }, { $set: { lastSeenAt: new Date(), lastSeenIp: context.ip, lastSeenUserAgent: context.userAgent } }),
  ]).catch(error => console.error('User activity tracking error:', error.message));
}

function recordLogin(req, user) {
  const context = requestContext(req);
  Promise.all([
    UserActivity.create({ userId: user._id, event: 'login', feature: 'auth', method: context.method, path: context.path, ip: context.ip, userAgent: context.userAgent }),
    CollectorUser.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date(), lastLoginIp: context.ip, lastLoginUserAgent: context.userAgent, lastSeenAt: new Date(), lastSeenIp: context.ip, lastSeenUserAgent: context.userAgent }, $inc: { loginCount: 1 } }),
  ]).catch(error => console.error('User login tracking error:', error.message));
}

module.exports = { clientIp, featureFromPath, recordActivity, recordLogin };
