const bot = require('../../bot');
const { BOT_TOKEN, CHANNEL_ID } = require('../../config/env');

const errorMessage = error => error?.response?.description || error?.message || 'Неизвестная ошибка';

exports.getStatus = async (_req, res) => {
  const result = {
    checkedAt: new Date().toISOString(),
    bot: { connected: false, username: null, name: null, id: null, error: null },
    channel: { configured: Boolean(CHANNEL_ID), connected: false, id: CHANNEL_ID || null, title: null, username: null, type: null, botStatus: null, canPublish: false, error: null },
  };

  if (!BOT_TOKEN) {
    result.bot.error = 'BOT_TOKEN не настроен';
    result.channel.error = 'Нельзя проверить канал без токена бота';
    return res.json(result);
  }

  let me;
  try {
    me = await bot.telegram.getMe();
    result.bot = { connected: true, username: me.username || null, name: [me.first_name, me.last_name].filter(Boolean).join(' '), id: me.id, error: null };
  } catch (error) {
    result.bot.error = errorMessage(error);
    result.channel.error = 'Сначала необходимо подключить бота';
    return res.json(result);
  }

  if (!CHANNEL_ID) {
    result.channel.error = 'CHANNEL_ID не настроен';
    return res.json(result);
  }

  try {
    const chat = await bot.telegram.getChat(CHANNEL_ID);
    result.channel.connected = true;
    result.channel.title = chat.title || chat.first_name || null;
    result.channel.username = chat.username || null;
    result.channel.type = chat.type || null;

    try {
      const member = await bot.telegram.getChatMember(CHANNEL_ID, me.id);
      result.channel.botStatus = member.status || null;
      result.channel.canPublish = member.status === 'creator' || (member.status === 'administrator' && member.can_post_messages !== false);
    } catch (error) {
      result.channel.error = `Канал найден, но права бота проверить не удалось: ${errorMessage(error)}`;
    }
  } catch (error) {
    result.channel.error = errorMessage(error);
  }

  return res.json(result);
};
