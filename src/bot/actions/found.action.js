const postService = require("../services/post.service");

module.exports = async (ctx) => {
  const orderId = ctx.match[1];

  try {
    await postService.markOrderAsFound(orderId);
    await ctx.editMessageText("✅ Buyurtmangiz «Topildi» deb belgilandi.");
  } catch (err) {
    console.error("❌ Found action error:", err);
    await ctx.reply("❌ Xatolik yuz berdi, buyurtmani «Topildi» deb belgilab bo‘lmadi.");
  }
};



