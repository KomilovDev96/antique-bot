module.exports = async (ctx) => {
  ctx.session = {}; // Clear session
  await ctx.editMessageText("❌ Amal bekor qilindi.");
  return ctx.scene.leave(); // Exit current scene if any
};



