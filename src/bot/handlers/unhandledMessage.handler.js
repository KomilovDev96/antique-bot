const { Markup } = require("telegraf");
const mainKeyboard = require("../keyboards/main.keyboard");

module.exports = async (ctx) => {
  if (!ctx.session?.flow && !ctx.session?.replyTo) {
    await ctx.reply("Kechirasiz, men sizning so'rovingizni tushunmadim. Iltimos, asosiy menyudagi tugmalardan birini ishlating.", mainKeyboard);
  }
};
