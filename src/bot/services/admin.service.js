const Post = require("../../models/Post");
const { ADMIN_ID, CHANNEL_ID, BOT_TOKEN } = require("../../config/env");
const { downloadImageBuffer, addWatermark, escapeHtml, sendMediaGroup } = require("../utils");

const adminService = {
  approvePost: async (telegram, postId) => {
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    try {
      const safe = (t) => escapeHtml(t || "");
      const tgLinkHtml =
        '\n\n👉 Kanal: <a href="https://t.me/antikvaruzbekistan">@antikvaruzbekistan</a>';

      const watermarkedBuffers = [];
      for (const filePath of post.photos) {
        const url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;
        const buffer = await downloadImageBuffer(url);
        const watermarkedBuffer = await addWatermark(buffer);
        watermarkedBuffers.push(watermarkedBuffer);
      }

      const mediaGroupForChannel = watermarkedBuffers.map((imgBuffer, idx) => ({
        type: 'photo',
        media: { source: imgBuffer },
        ...(idx === 0 && { caption: `
🏺 <b>${safe(post.title)}</b>
📋 ${safe(post.condition)}
💰 ${safe(post.price)}
🏙️ ${safe(post.city)}
☎️ ${safe(post.contact)}
${post.username ? "👤 @" + safe(post.username) : ""}
🔢 Kod: <code>${safe(post.uniqueCode)}</code>
🧾 ${safe(post.description)}${tgLinkHtml}`,
          parse_mode: "HTML" }),
      }));

      const sentMessages = await telegram.sendMediaGroup(CHANNEL_ID, mediaGroupForChannel);
      const sentIds = sentMessages.map(msg => msg.message_id);

      const codeMsg = await telegram.sendMessage(
        CHANNEL_ID,
        `📦 <b>E’lon kodi:</b> <code>${safe(post.uniqueCode)}</code>`,
        { parse_mode: "HTML", reply_to_message_id: sentMessages[0].message_id, allow_sending_without_reply: true }
      );
      if (codeMsg?.message_id) sentIds.push(codeMsg.message_id);

      post.status = "approved";
      post.channelMessageIds = sentIds;
      await post.save();

      return post;
    } catch (err) {
      console.error("Error in adminService.approvePost:", err);
      throw err;
    }
  },

  rejectPost: async (telegram, postId) => {
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    try {
      post.status = "rejected";
      await post.save();

      await telegram.sendMessage(
        post.userId,
        `❌ Sizning e'loningiz rad etildi.\n📌 ${post.title || ""}\nMa'lumot uchun admin bilan bog'laning.`
      );

      return post;
    } catch (err) {
      console.error("Error in adminService.rejectPost:", err);
      throw err;
    }
  }
};

module.exports = adminService;
