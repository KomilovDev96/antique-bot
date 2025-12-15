const { Markup } = require("telegraf");

module.exports = async (ctx) => {
  if (ctx.session?.flow === "sell") {
    // If in sell flow and 'Tayyor' is pressed, simulate text input for the scene
    // The scene logic for handling '✅ Tayyor' will be triggered
    ctx.message.text = "✅ Tayyor";
    return ctx.wizard.steps[ctx.wizard.cursor](ctx);
  } else if (ctx.session?.flow === "estimate" && ctx.session?.step === "photo") {
    return ctx.reply("Iltimos, rasm yuboring, yoki bekor qilish uchun /cancel tugmasini bosing.");
  }
  return ctx.reply("Hozircha rasm yuklash jarayoni yo‘q.");
};
