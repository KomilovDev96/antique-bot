const { Markup } = require("telegraf");
const { ADMIN_ID } = require('../../config/env');
const Post = require('../../models/Post');

const buyFlow = async (ctx) => {
  const step = ctx.session.step;
  const text = ctx.message.text;

  switch (step) {
    case "item_name":
      ctx.session.order.itemName = text;
      ctx.session.step = "description";
      return ctx.reply("🧾 Tafsilotlarini yozing (yoki yozmasangiz 'yo‘q' deb yozing)");

    case "description":
      ctx.session.order.description = text === "yo‘q" ? "" : text;
      ctx.session.step = "contact";
      return ctx.reply("☎️ Aloqa uchun telefon raqamingiz yoki Telegram username yuboring:");

    case "contact":
      ctx.session.order.contact = text;
      ctx.session.step = "photo_question";
      return ctx.reply("📸 Rasm yuborishni xohlaysizmi? (Ha / Yo‘q)");

    case "photo_question":
      const answer = text.toLowerCase();
      if (answer === "ha" || answer === "да") {
        ctx.session.step = "waiting_photo";
        return ctx.reply("📸 Iltimos, rasm yuboring.");
      } else {
        const order = await Post.create({
          userId: ctx.from.id,
          username: ctx.from.username || null,
          type: 'buy',
          title: ctx.session.order.itemName,
          description: ctx.session.order.description,
          contact: ctx.session.order.contact,
        });

        await ctx.reply("✅ Buyurtma qabul qilindi! Admin tez orada bog‘lanadi.");
        await ctx.telegram.sendMessage(
          ADMIN_ID,
          `🆕 <b>Yangi buyurtma!</b>\n\n👤 @${ctx.from.username || "anonim"}\n🛍️ <b>${ctx.session.order.itemName}</b>\n📄 ${ctx.session.order.description || "-"}\n☎️ ${ctx.session.order.contact}\n📌 ID: <code>${order._id}</code>`,
          { parse_mode: "HTML" }
        );

        ctx.session = {};
        return;
      }
  }
};

const startBuyFlow = async (ctx) => {
  ctx.session = { flow: "buy", step: "item_name", order: {} };
  await ctx.reply("🛒 Nima sotib olmoqchisiz? (narsa nomini yozing)");
};

module.exports = { buyFlow, startBuyFlow };




