const postService = require("../services/post.service");

module.exports = async (ctx) => {
  const postId = ctx.match[1];

  try {
    await postService.markPostAsSold(ctx.telegram, postId);
    await ctx.answerCbQuery("Belgilandi");
    await ctx.reply("✅ E’loningiz «Sotilgan» deb belgilandi.");
  } catch (err) {
    console.error("Sold action error:", err);
    await ctx.answerCbQuery("Xato");
    await ctx.reply("❌ Xatolik yuz berdi, e’lonni «Sotilgan» deb belgilab bo‘lmadi.");
  }
};
