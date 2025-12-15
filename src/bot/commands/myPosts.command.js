const Post = require('../../models/Post');
const { downloadImageBuffer, escapeHtml } = require('../utils/index');
const { Markup } = require('telegraf');

module.exports = async (ctx) => {
  try {

    // ====== 1. Показываем ПРОДАЖИ ======
    const posts = await Post.find({ userId: ctx.from.id, type: 'sell', status: "approved" })
      .sort({ createdAt: -1 });

    if (posts.length) {
      await ctx.reply("📦 Sizning faol e’lonlaringiz:");

      for (const post of posts) {
        const caption =
          `🏺 ${post.title}\n` +
          `💰 ${post.price} • 🏙️ ${post.city}\n` +
          `📋 ${post.condition}\n` +
          `🔢 Kod: ${post.uniqueCode}`;

        const url = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${post.photos?.[0] || ""}`;
        let buf = null;

        try {
          if (post.photos?.[0]) buf = await downloadImageBuffer(url);
        } catch { }

        if (buf) {
          await ctx.replyWithPhoto({ source: buf }, {
            caption,
            reply_markup: {
              inline_keyboard: [
                [{ text: "✅ Sotilgan deb belgilash", callback_data: `sold_${post._id}` }],
              ],
            },
          });
        } else {
          await ctx.reply(caption, Markup.inlineKeyboard([
            [Markup.button.callback("✅ Sotilgan deb belgilash", `sold_${post._id}`)]
          ]));
        }
      }

    } else {
      await ctx.reply("📭 Sizda faol e’lonlar yo'q.");
    }


    // ====== 2. Показываем ЗАЯВКИ ПОКУПКИ ======
    const orders = await Post.find({ userId: ctx.from.id, type: 'buy', status: "pending" })
      .sort({ createdAt: -1 });

    if (orders.length) {
      await ctx.reply("🛒 Sizning sotib olish bo‘yicha so‘rovlariingiz:");

      for (const order of orders) {
        const item = escapeHtml(order.title || "Noma'lum");
        const desc = escapeHtml(order.description || "-");
        const contact = escapeHtml(order.contact || "-");

        const caption =
          `🛒 ${item}\n` +
          `📄 ${desc}\n` +
          `☎️ ${contact}\n` +
          `ID: ${order._id}`;

        await ctx.reply(caption, {
          reply_markup: {
            inline_keyboard: [
              [{ text: "🤝 Men topdim!", callback_data: `found_${order._id}` }]
            ]
          }
        });
      }
    }

    await ctx.reply("🔎 E’lon yoki so‘rovni topish uchun 5 xonali kodni yuboring.");

  } catch (err) {
    console.error("Mening e'lonlarim error:", err);
    await ctx.reply("❌ Xatolik yuz berdi.");
  }
};

