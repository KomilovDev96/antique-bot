const { Scenes } = require("telegraf");
const Estimate = require("../../models/Estimate");
const { ADMIN_ID, BOT_TOKEN } = require("../../config/env");
const { downloadImageBuffer, escapeHtml } = require("../utils");

const estimateWizard = new Scenes.WizardScene(
  "estimate-scene",
  async (ctx) => {
    ctx.session.estimate = { photos: [] };
    await ctx.reply("📸 Iltimos, predmetning rasmini yuboring (1–5 ta).");
    return ctx.wizard.next();
  },
  async (ctx) => {
    // Step: collect photos (up to 5) and/or move to description
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
      await ctx.reply(`✅ Rasm qabul qilindi (${count}/5). Yana yuboring yoki tavsif yozing.`);
      return;
    }

    if (!ctx.message?.text) {
      await ctx.reply("⚠️ Tavsif yozing yoki rasm yuboring.");
      return;
    }

    // Move to description step
    ctx.session.estimate.description = ctx.message.text;
    try {
      const { photos = [], description } = ctx.session.estimate;
      if (!photos.length) {
        await ctx.reply("⚠️ Avval kamida bitta rasm yuboring.");
        return;
      }

      const estimate = await Estimate.create({
        userId: ctx.from.id,
        username: ctx.from.username || null,
        photos,
        description,
      });

      // Send album to admin without inline buttons
      const mediaGroup = [];
      for (let i = 0; i < photos.length; i++) {
        const url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${photos[i]}`;
        const buffer = await downloadImageBuffer(url);
        mediaGroup.push({
          type: "photo",
          media: { source: buffer },
          ...(i === 0
            ? {
                caption: `
🧮 <b>Yangi baholash so‘rovi!</b>

👤 @${ctx.from.username || "anonim"}
🆔 ID: ${ctx.from.id}
📄 <b>Tavsif:</b>
${escapeHtml(description)}

📌 So‘rov ID: <code>${estimate._id}</code>
`,
                parse_mode: "HTML",
              }
            : {}),
        });
      }

      await ctx.telegram.sendMediaGroup(ADMIN_ID, mediaGroup);

      await ctx.reply("🕓 So‘rovingiz yuborildi. Admin tez orada javob beradi!");
    } catch (error) {
      console.error("Error creating and sending estimate:", error);
      await ctx.reply("❌ Xatolik yuz berdi, qayta urinib ko‘ring.");
    }

    ctx.session.estimate = null;
    return ctx.scene.leave();
  }
);

module.exports = estimateWizard;

