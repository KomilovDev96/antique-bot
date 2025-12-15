const adminService = require("../services/admin.service");

module.exports = async (ctx) => {
  const postId = ctx.match[1];

  try {
    await adminService.rejectPost(ctx.telegram, postId);
    await ctx.editMessageText("❌ E’lon rad etildi.");
  } catch (err) {
    console.error("❌ Reject action error:", err);
    await ctx.reply("❌ Xatolik: e’lonni rad etib bo‘lmadi.");
  }
};



