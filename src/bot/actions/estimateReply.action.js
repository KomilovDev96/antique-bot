const Estimate = require('../../models/Estimate');

module.exports = async (ctx) => {
  const estimateId = ctx.match[1];
  return ctx.scene.enter("admin-reply-scene", { estimateId });
};



