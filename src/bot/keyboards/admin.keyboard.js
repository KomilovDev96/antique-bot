const { Markup } = require("telegraf");

const adminKeyboard = Markup.keyboard([
  ["📊 Statistika", "⚙️ Sozlamalar"],
  ["◀️ Asosiy menyu"],
]).resize();

module.exports = adminKeyboard;




