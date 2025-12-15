const { Markup } = require("telegraf");
const { ADMIN_ID, BOT_TOKEN } = require('../../config/env');
const { downloadImageBuffer, escapeHtml } = require('../utils/index');
const Post = require('../../models/Post');

function generateCode() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

const sellFlow = async (ctx) => {
  const step = ctx.session.step;
  const text = ctx.message.text;

  switch (step) {
    case "photos":
      // Photo handling is done in a separate bot.on("photo") handler
      break;

    case "title":
      ctx.session.post.title = text;
      ctx.session.step = "condition";
      return ctx.reply("📋 Holatini yozing (masalan: yaxshi, o‘rtacha):");

    case "condition":
      ctx.session.post.condition = text;
      ctx.session.step = "price";
      return ctx.reply("💰 Narxini yozing ($ yoki so‘m):");

    case "price":
      ctx.session.post.price = text;
      ctx.session.step = "city";
      return ctx.reply("🏙️ Qaysi shaharda joylashgan?");

    case "city":
      ctx.session.post.city = text;
      ctx.session.step = "contact";
      return ctx.reply("☎️ Aloqa uchun raqam yoki Telegram manzil:");

    case "contact":
      ctx.session.post.contact = text;
      ctx.session.step = "description";
      return ctx.reply("🧾 Qo‘shimcha ma’lumot (yili, og‘irligi va hokazo):");

    case "description":
      ctx.session.post.description = text;
      ctx.session.step = "confirm";

      const { title, condition, price, city, contact, description: desc } = ctx.session.post;
      const username = ctx.from.username ? `@${ctx.from.username}` : "";

      const preview = `🏺 ${title}\n📋 Holati: ${condition}\n💰 Narxi: ${price}\n🏙️ Shahar: ${city}\n☎️ ${contact}\n${username}\n🧾 ${desc}`;

      await ctx.reply(
        preview,
        Markup.inlineKeyboard([
          [Markup.button.callback("✅ Tasdiqlash", "send_for_approval")],
          [Markup.button.callback("❌ Bekor qilish", "cancel_post")],
        ])
      );
      return;
  }
};

const startSellFlow = async (ctx) => {
  ctx.session = {
    flow: "sell",
    step: "photos",
    post: { type: "sell", photos: [] },
  };

  await ctx.reply("📸 1–5 ta rasm yuboring (birma-bir). Tugatgach yozing yoki bosing “✅ Tayyor”");
};

const sendForApproval = async (ctx) => {
  const post = ctx.session.post;
  if (!post) return;

  try {
    const saved = await Post.create({
      ...post,
      userId: ctx.from.id,
      username: ctx.from.username || null,
      status: "pending",
      uniqueCode: generateCode(),
    });

    const mediaGroup = [];
    for (const p of post.photos) {
      const url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${p}`;
      const buffer = await downloadImageBuffer(url);
      mediaGroup.push({ type: "photo", media: { source: buffer } });
    }

    if (!mediaGroup.length) {
      return ctx.reply("⚠️ Rasm topilmadi, qayta yuboring.");
    }

    const safe = (t) => escapeHtml(t);
    const tgLinkHtml = '\n\n👉 Kanal: <a href="https://t.me/antikvaruzbekistan">@antikvaruzbekistan</a>';
    mediaGroup[0].caption = `
📢 <b>Yangi e’lon keldi!</b>
🧾 Tekshirib tasdiqlang.

🏺 <b>${safe(post.title)}</b>
📋 Holati: ${safe(post.condition)}
💰 Narxi: ${safe(post.price)}
🏙️ Shahar: ${safe(post.city)}
☎️ Telefon: ${safe(post.contact)}
${ctx.from.username ? "👤 @" + safe(ctx.from.username) : ""}
🔢 Kod: <code>${saved.uniqueCode}</code>
📌 ID: <code>${saved._id}</code>${tgLinkHtml}
`;
    mediaGroup[0].parse_mode = "HTML";

    await ctx.telegram.sendMediaGroup(ADMIN_ID, mediaGroup);
    await ctx.telegram.sendMessage(
      ADMIN_ID,
      `🕵️‍♂️ Post ID: <code>${saved._id}</code>\nTasdiqlaysizmi?`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "✅ Tasdiqlash", callback_data: `approve_${saved._id}` }],
            [{ text: "❌ Bekor qilish", callback_data: `reject_${saved._id}` }],
          ],
        },
      }
    );

    // await ctx.editMessageText("🕓 E’lon yuborildi, admin tasdiqlashini kuting.");
  } catch (err) {
    console.error("❌ Error saving post:", err.message);
    await ctx.reply("❌ Xatolik: e’lon yubорib bo‘lmadi.");
  }

  ctx.session = {};
};

module.exports = { sellFlow, startSellFlow, sendForApproval };

