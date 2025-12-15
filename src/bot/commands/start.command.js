const User = require('../../models/User');
const mainKeyboard = require('../keyboards/main.keyboard');
const { ADMIN_ID } = require('../../config/env');

module.exports = async (ctx) => {
  const tgUser = ctx.from;

  try {
    let user = await User.findOne({ telegramId: tgUser.id });
    if (!user) {
      await User.create({
        telegramId: tgUser.id,
        username: tgUser.username,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
        role: String(tgUser.id) === ADMIN_ID ? "admin" : "user",
      });
    }
  } catch (e) {
    console.error("Ошибка при сохранении пользователя:", e.message);
  }

  ctx.session = {};

  await ctx.reply(
    "Assalomu alaykum! Nima qilamiz?\n" +
    "🏺 Antikvarni sotmoqchimisiz, 💰 sotib olmoqchimisiz yoki bahosini bilmoqchimisiz?",
    mainKeyboard
  );
};




