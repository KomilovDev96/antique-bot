const Post = require("../../models/Post");
const { ADMIN_ID, BOT_TOKEN } = require("../../config/env");
const { downloadImageBuffer, escapeHtml, sendMediaGroup } = require("../utils");

function generateCode() {
  return Math.floor(10000 + Math.random() * 90000).toString();
}

const postService = {
  createAndSendSellPost: async (ctx) => {
    const postData = ctx.session.post;
    if (!postData) {
      throw new Error("Post data not found in session.");
    }

    try {
      const savedPost = await Post.create({
        ...postData,
        userId: ctx.from.id,
        username: ctx.from.username || null,
        status: "pending",
        uniqueCode: generateCode(),
      });

      const mediaFiles = [];
      for (const p of postData.photos) {
        const url = `https://api.telegram.org/file/bot${BOT_TOKEN}/${p}`;
        const buffer = await downloadImageBuffer(url);
        mediaFiles.push({ type: "photo", media: buffer });
      }

      if (!mediaFiles.length) {
        throw new Error("No photos found for the post.");
      }

      const safe = (t) => escapeHtml(t);
      const tgLinkHtml = '\n\n👉 Kanal: <a href="https://t.me/antikvaruzbekistan">@antikvaruzbekistan</a>';

      mediaFiles[0].caption = `
📢 <b>Yangi e’lon keldi!</b>
🧾 Tekshirib tasdiqlang.

🏺 <b>${safe(postData.title)}</b>
📋 Holati: ${safe(postData.condition)}
💰 Narxi: ${safe(postData.price)}
🏙️ Shahar: ${safe(postData.city)}
☎️ Telefon: ${safe(postData.contact)}
${ctx.from.username ? "👤 @" + safe(ctx.from.username) : ""}
🔢 Kod: <code>${savedPost.uniqueCode}</code>
📌 ID: <code>${savedPost._id}</code>${tgLinkHtml}
`;
      mediaFiles[0].parse_mode = "HTML";

      await sendMediaGroup(ctx, ADMIN_ID, mediaFiles);

      await ctx.telegram.sendMessage(
        ADMIN_ID,
        `🕵️‍♂️ Post ID: <code>${savedPost._id}</code>\nTasdiqlaysizmi?`,
        {
          parse_mode: "HTML",
          reply_markup: {
            inline_keyboard: [
              [{ text: "✅ Tasdiqlash", callback_data: `approve_${savedPost._id}` }],
              [{ text: "❌ Bekor qilish", callback_data: `reject_${savedPost._id}` }],
            ],
          },
        }
      );

      ctx.session.post = null; // Clear session data after successful creation
      return savedPost; // Return the created post
    } catch (error) {
      console.error("Error in createAndSendSellPost:", error);
      throw error;
    }
  },

  getPostById: async (postId) => {
    return await Post.findById(postId);
  },

  getPostByUniqueCode: async (code, userId) => {
    return await Post.findOne({ uniqueCode: code, userId: userId, status: "approved" });
  },

  getSellPostsByUserId: async (userId) => {
    return await Post.find({ userId: userId, type: 'sell', status: "approved" }).sort({ createdAt: -1 });
  },

  getBuyOrdersByUserId: async (userId) => {
    return await Post.find({ userId: userId, type: 'buy', status: "pending" }).sort({ createdAt: -1 });
  },

  markPostAsSold: async (telegram, postId) => {
    const post = await Post.findById(postId);
    if (!post) throw new Error("Post not found");

    post.status = "sold";
    await post.save();

    // Notify channel if we have message IDs
    const targetMessageId = post.channelMessageIds?.[0];
    if (targetMessageId) {
      await telegram.sendMessage(
        process.env.CHANNEL_ID,
        "Rahmat barchangizga, bu postdagi mahsulot sotildi!",
        {
          reply_to_message_id: targetMessageId,
          allow_sending_without_reply: true,
        }
      );
    }

    // Notify owner
    if (post.userId) {
      await telegram.sendMessage(
        post.userId,
        "✅ E’loningiz sotilgan deb belgilandi. Rahmat!"
      );
    }

    return post;
  },

  markOrderAsFound: async (orderId) => {
    return await Post.findByIdAndUpdate(orderId, { status: "completed" }, { new: true });
  },

  // Other post-related methods will go here
};

module.exports = postService;
