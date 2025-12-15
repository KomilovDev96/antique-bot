const { Markup } = require("telegraf");

module.exports = async (ctx) => {
  if (ctx.session?.flow !== "sell") return ctx.reply("Hozircha rasm yuklash jarayoni yo‘q.");
  if (!ctx.session.post?.photos?.length) return ctx.reply("Avval kamida bitta rasm yuboring 📸");

  ctx.session.step = "title";
  await ctx.reply("🪙 Narsa nomini yozing:", Markup.removeKeyboard());
};


