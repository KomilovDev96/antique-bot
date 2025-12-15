const { Scenes } = require("telegraf");

// Handlers
const startHandler = require("./handlers/start.handler");
const myPostsHandler = require("./handlers/myPosts.handler");
const tayyorHandler = require("./handlers/tayyor.handler");
const searchByCodeHandler = require("./handlers/searchByCode.handler");
const photoHandler = require("./handlers/photo.handler");
const textHandler = require("./handlers/text.handler");
const unhandledMessageHandler = require("./handlers/unhandledMessage.handler");

// Actions
const approveAction = require("./actions/approve.action");
const rejectAction = require("./actions/reject.action");
const estimateReplyAction = require("./actions/estimateReply.action");
const cancelAction = require("./actions/cancel.action");
const soldAction = require("./actions/sold.action");
const foundAction = require("./actions/found.action");
const sendForApprovalAction = require("./actions/sendForApproval.action");

// Scenes
const sellScene = require("./scenes/sell.scene");
const estimateScene = require("./scenes/estimate.scene");
// const adminReplyScene = require("./scenes/adminReply.scene");

module.exports = (bot) => {
  const stage = new Scenes.Stage([
    sellScene,
    estimateScene,
  ]);

  bot.use(stage.middleware());

  // Commands
  bot.start(startHandler);
  bot.hears("📦 Mening e'lonlarim", myPostsHandler);
  bot.hears("🏺 Sotmoqchiman", (ctx) => ctx.scene.enter("sell-scene"));
  bot.hears("💰 Sotib olmoqchiman", (ctx) => ctx.reply("Hozircha sotib olish funksiyasi mavjud emas.")); // TODO: Implement buy flow scene
  bot.hears("💰 Narxini bilmoqchiman", (ctx) => ctx.scene.enter("estimate-scene"));
  bot.hears("✅ Tayyor", tayyorHandler);
  bot.hears(/^\d{5}$/, searchByCodeHandler);

  // Message Handlers
  bot.on("photo", photoHandler);
  bot.on("text", textHandler);


  // Actions
  bot.action(/approve_(.+)/, approveAction);
  bot.action(/reject_(.+)/, rejectAction);
  bot.action(/estimate_reply_(.+)/, estimateReplyAction);
  bot.action("cancel_post", cancelAction);
  bot.action("send_for_approval", sendForApprovalAction);
  bot.action(/sold_(.+)/, soldAction);
  bot.action(/found_(.+)/, foundAction);

  // Catch-all for unhandled messages
  bot.on("message", unhandledMessageHandler);
};
