const Post = require('../../models/Post');
const { escapeHtml, downloadImageBuffer } = require('../utils/index');
const { Markup } = require('telegraf');

module.exports = async (ctx) => {
  const code = ctx.message.text.trim();
  const post = await Post.findOne({ uniqueCode: code, userId: ctx.from.id, status: "approved" });
  if (!post) return ctx.reply("❌ Kod bo‘yicha faol e'lon topilmadi.");

  const caption =
    `🏺 ${post.title}\n💰 ${post.price} • 🏙️ ${post.city}\n📋 ${post.condition}\n🔢 Kod: ${post.uniqueCode}`;

  const url = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${post.photos?.[0] || ""}`;
  try {
    const buf = post.photos?.[0] ? await downloadImageBuffer(url) : null;
    if (buf) {
      await ctx.replyWithPhoto(
        { source: buf },
        {
          caption,
          reply_markup: {
            inline_keyboard: [[{ text: "✅ Sotilgan deb belgilash", callback_data: `sold_${post._id}` }]],
          },
        }
      );
    } else {
      await ctx.reply(
        caption,
        Markup.inlineKeyboard([[Markup.button.callback("✅ Sotilgan deb belgilash", `sold_${post._id}`)]])
      );
    }
  } catch {
    await ctx.reply(
      caption,
      Markup.inlineKeyboard([[Markup.button.callback("✅ Sotilgan deb belgilash", `sold_${post._id}`)]])
    );
  }
};

