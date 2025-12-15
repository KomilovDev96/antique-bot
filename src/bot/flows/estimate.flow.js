const { Markup } = require("telegraf");
const { ADMIN_ID, BOT_TOKEN } = require('../../config/env');
const { downloadImageBuffer, escapeHtml } = require('../utils/index');
const Estimate = require('../../models/Estimate');

const estimateFlow = async (ctx) => {
  const step = ctx.session.step;
  const text = ctx.message.text;

  switch (step) {
    case "photo":
      // Photo handling is done in a separate bot.on("photo") handler
      break;

    case "description":
      const description = text;
      const photos = ctx.session.photos || [];

      if (!photos.length) {
        await ctx.reply("⚠️ Avval rasm yuboring.");
        return;
      }

      try {
        const estimate = await Estimate.create({
          userId: ctx.from.id,
          username: ctx.from.username || null,
          photos,
          description,
        });

        const safeDesc = escapeHtml(description);
        // Send as media group (album) to admin
        const mediaGroup = [];
        for (let i = 0; i < photos.length; i++) {
          const filePath = photos[i];
          const url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
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
${safeDesc}

📌 So‘rov ID: <code>${estimate._id}</code>
`,
                  parse_mode: "HTML",
                }
              : {}),
          });
        }

        await ctx.telegram.sendMediaGroup(ADMIN_ID, mediaGroup);

        await ctx.reply("🕓 So‘rovingiz yuborildi. Admin tez orada javob beradi!");
        ctx.session = {};
      } catch (err) {
        console.error("❌ Estimate send error:", err.message);
        await ctx.reply("❌ Xatolik yuz berdi, qayta urinib ko‘ring.");
      }
      return;
  }
};

const startEstimateFlow = async (ctx) => {
  ctx.session = { flow: "estimate", step: "photo", photos: [] };
  await ctx.reply("📸 Iltimos, predmetning rasmini yuboring (1–5 ta).");
};

module.exports = { estimateFlow, startEstimateFlow };
