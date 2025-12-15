// src/utils/publishPost.js
const https = require("https");
const fs = require("fs");
const bot = require("../bot");
const addWatermark = require("../utils/watermark");
const Post = require("../models/Post");

const CHANNEL_ID = process.env.CHANNEL_ID;
const BOT_TOKEN = process.env.BOT_TOKEN;

function downloadImageBuffer(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        const data = [];
        res.on("data", (chunk) => data.push(chunk));
        res.on("end", () => resolve(Buffer.concat(data)));
      })
      .on("error", reject);
  });
}

function escapeHtml(text) {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

module.exports = async function publishPostToTelegram(postOrId) {
  let post = postOrId;
  if (typeof postOrId === "string") {
    post = await Post.findById(postOrId);
  }
  if (!post) throw new Error("Post not found");

  const safe = (t) => escapeHtml(t || "");
  const tgLinkHtml = '\n\n👉 Kanal: <a href="https://t.me/antikvaruzbekistan">@antikvaruzbekistan</a>';

  // Watermark photos
  const watermarked = [];
  for (const filePath of post.photos) {
    const url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
    const buffer = await downloadImageBuffer(url);
    const outPath = await addWatermark(buffer);
    watermarked.push(outPath);
  }

  if (!watermarked.length) {
    throw new Error("No photos to publish");
  }

  const caption = `
🏺 <b>${safe(post.title)}</b>
📋 ${safe(post.condition)}
💰 ${safe(post.price)}
🏙️ ${safe(post.city)}
☎️ ${safe(post.contact)}
${post.username ? "👤 @" + safe(post.username) : ""}
🔢 Kod: <code>${safe(post.uniqueCode)}</code>
🧾 ${safe(post.description)}${tgLinkHtml}`;

  console.log("📤 Publishing post:", post.uniqueCode, "to channel:", CHANNEL_ID);

  // Send as Telegram album (media group)
  const mediaGroup = watermarked.map((filePath, idx) => ({
    type: "photo",
    media: { source: fs.createReadStream(filePath) },
    ...(idx === 0 ? { caption, parse_mode: "HTML" } : {}),
  }));

  const sent = await bot.telegram.sendMediaGroup(CHANNEL_ID, mediaGroup, {
    allow_sending_without_reply: true,
  });

  const sentIds = Array.isArray(sent) ? sent.map((m) => m.message_id) : [];
  console.log("✅ Final sentIds (from publishPost):", sentIds);

  post.channelMessageIds = sentIds;
  post.status = "approved";
  await post.save();

  await bot.telegram.sendMessage(
    post.userId,
    "✅ Sizning e’lon tasdiqlandi va kanalga joylandi!"
  );
};
