const userService = require("../services/user.service");
const mainKeyboard = require("../keyboards/main.keyboard");

module.exports = async (ctx) => {
  const tgUser = ctx.from;

  try {
    await userService.findOrCreateUser(tgUser);
  } catch (e) {
    console.error("Ошибка при обработке команды /start:", e.message);
  }

  ctx.session = {}; // Clear session on start

  await ctx.reply(
    "Assalomu alaykum! Nima qilamiz?\n" +
    "🏺 Antikvarni sotmoqchimisiz, 💰 sotib olmoqchimisiz yoki bahosini bilmoqchimisiz?",
    mainKeyboard
  );
};
