const adminService = require("../services/admin.service");

module.exports = async (ctx) => {
  const postId = ctx.match[1];

  try {
    await adminService.approvePost(ctx.telegram, postId);
    await ctx.editMessageText("✅ E’lon tasdiqlandi va kanalga joylandi!");
  } catch (err) {
    console.error("❌ Approve action error:", err);
    await ctx.reply("❌ Xatolik: e’lonni joylab bo‘lmadi.");
  }
};


