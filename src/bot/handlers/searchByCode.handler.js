const { Markup } = require("telegraf");
const { downloadImageBuffer } = require("../utils");
const postService = require("../services/post.service");

module.exports = async (ctx) => {
  const code = ctx.message.text.trim();

  try {
    const post = await postService.getPostByUniqueCode(code, ctx.from.id);
    if (!post) {
      return ctx.reply("❌ Kod bo‘yicha faol e'lon topilmadi.");
    }

    const caption =
      `🏺 ${post.title}\n💰 ${post.price} • 🏙️ ${post.city}\n📋 ${post.condition}\n🔢 Kod: ${post.uniqueCode}`;

    let buf = null;
    try {
      if (post.photos?.[0]) {
        const url = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${post.photos[0]}`;
        buf = await downloadImageBuffer(url);
      }
    } catch (err) {
      console.error("Error downloading image for searchByCode:", err);
    }

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
  } catch (err) {
    console.error("Search by code error:", err);
    await ctx.reply("❌ Xatolik yuz berdi.");
  }
};
