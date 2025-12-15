const { BOT_TOKEN, ADMIN_ID } = require('../../config/env');
const { downloadImageBuffer, escapeHtml } = require('../utils/index');
const Post = require('../../models/Post');

const handlePhoto = async (ctx) => {
  const flow = ctx.session?.flow;
  const largestPhoto = ctx.message.photo.at(-1);
  const fileId = largestPhoto.file_id;

  if (!fileId) return ctx.reply("⚠️ Xatolik: rasm fayl ID topilmadi.");

  try {
    const file = await ctx.telegram.getFile(fileId);
    if (!file?.file_path) return ctx.reply("⚠️ Xatolik: rasmni olishda muammo.");

    const shortPath = file.file_path.startsWith("photos/")
      ? file.file_path
      : `photos/${require('path').basename(file.file_path)}`;

    // === Buyurtma ===
    if (flow === "buy" && ctx.session.step === "waiting_photo") {
      ctx.session.order.photoPath = shortPath;

      const order = await Post.create({
        userId: ctx.from.id,
        username: ctx.from.username || null,
        type: 'buy',
        title: ctx.session.order.itemName,
        description: ctx.session.order.description,
        contact: ctx.session.order.contact,
        photos: [shortPath], // Store photo path
      });

      await ctx.reply("✅ Buyurtma qabul qilindi! Admin tez orada bog‘lanadi.");
      await ctx.telegram.sendMessage(
        ADMIN_ID,
        `🛒 <b>Yangi buyurtma!</b>\n\n👤 @${ctx.from.username || "anonim"}\n🏺 <b>${ctx.session.order.itemName}</b>\n📄 ${ctx.session.order.description || "-"}\n☎️ ${ctx.session.order.contact}\n🆔 ID: <code>${order._id}</code>`,
        { parse_mode: "HTML" }
      );

      ctx.session = {};
      return;
    }

    // === Baholash === (1–5 ta foto)
    if (flow === "estimate" && (ctx.session.step === "photo" || ctx.session.step === "description")) {
      ctx.session.photos = ctx.session.photos || [];

      if (ctx.session.photos.length >= 5) {
        await ctx.reply("⚠️ 5 tadan ko‘p rasm qabul qilinmaydi. Tavsif yozing.");
        return;
      }

      ctx.session.photos.push(file.file_path);
      const count = ctx.session.photos.length;
      await ctx.reply(`✅ Rasm qabul qilindi (${count}/5). Yana yuboring yoki tavsif yozing.`);

      ctx.session.step = "description";
      return;
    }

    // === Sotish ===
    if (flow === "sell" && ctx.session.step === "photos") {
      const current = ctx.session.post.photos.length;
      if (current >= 5) {
        await ctx.reply("⚠️ 5 tadan ko‘p rasm qabul qilinmaydi. “Tayyor” tugmasini bosing.");
        return;
      }

      ctx.session.post.photos.push(shortPath);

      const count = ctx.session.post.photos.length;
      await ctx.reply(`✅ Rasm qabul qilindi (${count}/5)`);

      if (count >= 1) {
        const { Markup } = require('telegraf');
        await ctx.reply("📸 Yetarli rasm yuklandi! Endi “✅ Tayyor” tugmasini bosing.", Markup.keyboard([["✅ Tayyor"]]).resize());
      }
      return;
    }

  } catch (err) {
    console.error("⚠️ getFile error (commonFlow/photo):", err.message);
    await ctx.reply("❌ Xatolik: rasmni yuklab bo‘lmadi.");
  }
};

const handleText = async (ctx) => {
  const flow = ctx.session?.flow;
  const replyTo = ctx.session?.replyTo;

  // Handle admin reply to estimate
  if (replyTo) {
    const { escapeHtml } = require('../utils/index');
    await ctx.telegram.sendMessage(
      replyTo,
      `💬 <b>Admin javobi:</b>\n${escapeHtml(ctx.message.text)}`,
      { parse_mode: "HTML" }
    );
    await ctx.reply("✅ Javob foydalanuvchiga yuborildi!");
    ctx.session = {};
    return;
  }

  if (flow === "sell") {
    const { sellFlow } = require('./sell.flow');
    await sellFlow(ctx);
  } else if (flow === "buy") {
    const { buyFlow } = require('./buy.flow');
    await buyFlow(ctx);
  } else if (flow === "estimate") {
    const { estimateFlow } = require('./estimate.flow');
    await estimateFlow(ctx);
  }
};

module.exports = { handlePhoto, handleText };
