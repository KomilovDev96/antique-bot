const User = require("../../models/User");
const { ADMIN_ID } = require("../../config/env");

const userService = {
  findOrCreateUser: async (tgUser) => {
    try {
      let user = await User.findOne({ telegramId: tgUser.id });
      if (!user) {
        user = await User.create({
          telegramId: tgUser.id,
          username: tgUser.username,
          firstName: tgUser.first_name,
          lastName: tgUser.last_name,
          role: String(tgUser.id) === ADMIN_ID ? "admin" : "user",
        });
      }
      return user;
    } catch (e) {
      console.error("Ошибка при сохранении пользователя:", e.message);
      throw e;
    }
  },
  // Other user-related methods will go here
};

module.exports = userService;
