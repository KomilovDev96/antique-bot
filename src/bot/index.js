const { Telegraf, Scenes, session } = require("telegraf");
const { BOT_TOKEN } = require("../config/env");
const setupHandlers = require("./setup");

const bot = new Telegraf(BOT_TOKEN);

bot.use(session());

setupHandlers(bot);

module.exports = bot;



