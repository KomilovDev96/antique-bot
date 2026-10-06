const crypto = require('crypto');

const hashPassword = (password) => new Promise((resolve, reject) => {
  const salt = crypto.randomBytes(16).toString('hex');
  crypto.scrypt(password, salt, 64, (error, derived) => error ? reject(error) : resolve(`${salt}:${derived.toString('hex')}`));
});
const verifyPassword = (password, stored) => new Promise((resolve, reject) => {
  const [salt, digest] = String(stored || '').split(':');
  if (!salt || !digest) return resolve(false);
  crypto.scrypt(password, salt, 64, (error, derived) => {
    if (error) return reject(error);
    const expected = Buffer.from(digest, 'hex');
    resolve(expected.length === derived.length && crypto.timingSafeEqual(expected, derived));
  });
});
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const createToken = () => crypto.randomBytes(48).toString('base64url');
module.exports = { hashPassword, verifyPassword, hashToken, createToken };
