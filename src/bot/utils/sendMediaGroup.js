const { Telegraf } = require("telegraf");

/**
 * Отправляет медиагруппу (фотографии) в указанный чат.
 * Все медиафайлы должны быть переданы как буферы.
 *
 * @param {import("telegraf").Context} ctx Контекст Telegraf.
 * @param {string | number} chatId ID чата, куда отправлять медиагруппу.
 * @param {Array<{type: string, media: Buffer | { source: Buffer }, caption?: string, parse_mode?: string}>} mediaFiles Массив объектов медиафайлов.
 * @returns {Promise<Array<import("telegraf/typings/core/types/Custom").Message.TextMessage | import("telegraf/typings/core/types/Custom").Message.PhotoMessage>>} Массив отправленных сообщений.
 */
async function sendMediaGroup(ctx, chatId, mediaFiles) {
  if (!mediaFiles || mediaFiles.length === 0) {
    throw new Error("Массив медиафайлов не может быть пустым.");
  }

  // Telegraf ожидает, что `media` для буфера будет объектом `{ source: Buffer }`
  const formattedMedia = mediaFiles.map(item => ({
    type: item.type,
    media: item.media instanceof Buffer ? { source: item.media } : item.media,
    caption: item.caption,
    parse_mode: item.parse_mode,
  }));

  try {
    const sentMessages = await ctx.telegram.sendMediaGroup(chatId, formattedMedia);
    return sentMessages;
  } catch (error) {
    console.error("Ошибка при отправке медиагруппы:", error);
    throw error;
  }
}

module.exports = sendMediaGroup;
