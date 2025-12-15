const { Markup } = require("telegraf");
const { downloadImageBuffer, escapeHtml } = require("../utils");
const postService = require("../services/post.service");

module.exports = async (ctx) => {
  try {
    // ====== 1. Показываем ПРОДАЖИ ======
    const sellPosts = await postService.getSellPostsByUserId(ctx.from.id);

    if (sellPosts.length) {
      await ctx.reply("📦 Sizning faol e’lonlaringiz:");

      for (const post of sellPosts) {
        const caption =
          `🏺 ${post.title}\n` +
          `💰 ${post.price} • 🏙️ ${post.city}\n` +
          `📋 ${post.condition}\n` +
          `🔢 Kod: ${post.uniqueCode}`;

        let buf = null;
        try {
          if (post.photos?.[0]) {
            const url = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${post.photos[0]}`;
            buf = await downloadImageBuffer(url);
          }
        } catch (err) {
          console.error("Error downloading image for myPosts:", err);
        }

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
    const buyOrders = await postService.getBuyOrdersByUserId(ctx.from.id);

    if (buyOrders.length) {
      await ctx.reply("🛒 Sizning sotib olish bo‘yicha so‘rovlariingiz:");

      for (const order of buyOrders) {
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
