const crypto = require('crypto');
const TelegramLinkCode = require('../../models/TelegramLinkCode');
module.exports = async (ctx) => {
  const code = crypto.randomBytes(4).toString('hex').toUpperCase();
  await TelegramLinkCode.deleteMany({ telegramId: String(ctx.from.id), usedAt: { $exists: false } });
  await TelegramLinkCode.create({ telegramId: String(ctx.from.id), username: ctx.from.username || null, code, expiresAt: new Date(Date.now() + 15 * 60 * 1000) });
  await ctx.reply(`Код для связи с мобильным приложением Antique AI:\n\n${code}\n\nВведите его в профиле приложения в течение 15 минут.`);
};
