module.exports = async (ctx) => {
  if (ctx.scene.current) {
    // If a scene is active, let the scene handle the photo
    return ctx.wizard.steps[ctx.wizard.cursor](ctx);
  }
  // If no scene is active, or scene didn't handle, ignore or reply with a general message
  // For now, we just ignore, as unhandled messages will be caught by the general message handler.
};
