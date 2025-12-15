const { Scenes, Markup } = require("telegraf");
const Estimate = require("../../models/Estimate");
const { BOT_TOKEN } = require("../../config/env");
const { downloadImageBuffer, escapeHtml } = require("../utils");

// Wizard flow for price estimation:
// step 0: ask for photos
// step 1: collect photos or description; after description show confirm buttons
// step 2: on callback, save and notify user
const estimateWizard = new Scenes.WizardScene(
  "estimate-scene",
  async (ctx) => {
    ctx.session.estimate = { photos: [], description: null };
    await ctx.reply("📸 Iltimos, predmetning rasmini yuboring (1–5 ta).");
    return ctx.wizard.next();
  },
  async (ctx) => {
    // Collect photos until description arrives
    if (ctx.message?.photo) {
      const fileId = ctx.message.photo.at(-1).file_id;
      const file = await ctx.telegram.getFile(fileId);
      if (!file?.file_path) {
        await ctx.reply("⚠️ Xatolik: rasmni olishda muammo.");
        return;
      }

      if (ctx.session.estimate.photos.length >= 5) {
        await ctx.reply("⚠️ 5 tadan ko‘p rasm qabul qilinmaydi. Tavsif yozing.");
        return;
      }

      ctx.session.estimate.photos.push(file.file_path);
      const count = ctx.session.estimate.photos.length;
      await ctx.reply(
        `✅ Rasm qabul qilindi (${count}/5). Yana yuboring yoki tasdiqlash uchun tavsif yozing.`,
        Markup.keyboard([["✅ Tasdiqlash"]]).resize()
      );
      return;
    }

    // Handle confirm button before description
    if (ctx.message?.text === "✅ Tasdiqlash" && !ctx.session.estimate.description) {
      await ctx.reply("📄 Tavsif yozing:", Markup.removeKeyboard());
      return;
    }

    // Description received
    if (ctx.message?.text) {
      if (!ctx.session.estimate.photos?.length) {
        try { await ctx.deleteMessage(); } catch {}
        await ctx.reply("⚠️ Avval 1–5 ta rasm yuboring.");
        return;
      }
      ctx.session.estimate.description = ctx.message.text;
      await ctx.reply(
        "Tasdiqlaysizmi?",
        Markup.inlineKeyboard([
          [Markup.button.callback("✅ Tasdiqlash", "send_estimate")],
          [Markup.button.callback("❌ Bekor qilish", "cancel_estimate")],
        ])
      );
      return ctx.wizard.next();
    }

    await ctx.reply("⚠️ Tavsif yozing yoki rasm yuboring.");
  },
  async (ctx) => {
    // Await callback confirm/cancel
    if (ctx.updateType !== "callback_query") {
      return;
    }

    const action = ctx.callbackQuery.data;
    if (action === "cancel_estimate") {
      await ctx.answerCbQuery("Bekor qilindi");
      await ctx.editMessageText("❌ So‘rov bekor qilindi.");
      ctx.session.estimate = null;
      return ctx.scene.leave();
    }

    if (action !== "send_estimate") {
      return;
    }

    const { photos = [], description } = ctx.session.estimate || {};
    if (!photos.length || !description) {
      await ctx.answerCbQuery("Ma’lumot yetarli emas");
      return;
    }

    try {
      await Estimate.create({
        userId: ctx.from.id,
        username: ctx.from.username || null,
        photos,
        description,
      });

      await ctx.answerCbQuery("Yuborildi");
      await ctx.editMessageText("🕓 Predmet adminlarga yuborildi, tez orada javob olasiz.");
    } catch (error) {
      console.error("Error creating and sending estimate:", error);
      await ctx.answerCbQuery("Xatolik");
      await ctx.editMessageText("❌ Xatolik yuz berdi, qayta urinib ko‘ring.");
    }

    ctx.session.estimate = null;
    return ctx.scene.leave();
  }
);

module.exports = estimateWizard;
