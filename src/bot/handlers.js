const { Markup } = require("telegraf");

const startCommand = require('./commands/start.command');
const myPostsCommand = require('./commands/myPosts.command');
const handleTayyorCommand = require('./commands/handleTayyor.command');
const { startSellFlow, sendForApproval } = require('./flows/sell.flow');
const { startBuyFlow } = require('./flows/buy.flow');
const { startEstimateFlow } = require('./flows/estimate.flow');
const { handlePhoto, handleText } = require('./flows/common.flow');
const approveAction = require('./actions/approve.action');
const rejectAction = require('./actions/reject.action');
const estimateReplyAction = require('./actions/estimateReply.action');
const cancelAction = require('./actions/cancel.action');
const soldAction = require('./actions/sold.action');
const foundAction = require('./actions/found.action');
const searchByCodeAction = require('./actions/searchByCode.action');
const linkCommand = require('./commands/link.command');

module.exports = (bot) => {
  bot.start(startCommand);
  bot.command('link', linkCommand);
  bot.hears("📦 Mening e'lonlarim", myPostsCommand);
  bot.hears("🏺 Sotmoqchiman", startSellFlow);
  bot.hears("💰 Sotib olmoqchiman", startBuyFlow);
  bot.hears("💰 Narxini bilmoqchiman", startEstimateFlow);
  bot.hears(/^\d{5}$/, searchByCodeAction);

  bot.on("photo", handlePhoto);
  bot.on("text", handleText);

  bot.action(/approve_(.+)/, approveAction);
  bot.action(/reject_(.+)/, rejectAction);
  bot.action(/estimate_reply_(.+)/, estimateReplyAction);
  bot.action("cancel_post", cancelAction);
  bot.action("send_for_approval", sendForApproval);
  bot.action(/sold_(.+)/, soldAction);
  bot.action(/found_(.+)/, foundAction);

  // Catch-all for unhandled messages
  bot.on('message', async (ctx) => {
    if (!ctx.session?.flow && !ctx.session?.replyTo) {
      await ctx.reply("Kechirasiz, men sizning so'rovingizni tushunmadim. Iltimos, asosiy menyudagi tugmalardan birini ishlating.", Markup.keyboard([
        ["🏺 Sotmoqchiman", "💰 Sotib olmoqchiman"],
        ["💰 Narxini bilmoqchiman"],
        ["📦 Mening e'lonlarim"],
      ]).resize());
    }
  });
};

