Live REST layer: `src/api/index.js` mounts `routes/{auth,admin,estimate,telegram}.routes.js`, each backed by a same-named controller in `src/api/controllers/`. Auth via `src/api/middlewares/auth.middleware.js` (JWT, checked against `JWT_SECRET`).

Live bot: `src/bot/index.js` builds the Telegraf instance, `src/bot/setup.js`/`handlers.js` wire commands/actions/scenes/flows. Session state via `telegraf-session-local` (`src/bot/middlewares/session.js`, in-memory/local-file, not Mongo).

Models (Mongoose, `src/models/`): `Post`, `Estimate`, `Order`, `User`. `Post.uniqueCode` previously had a duplicate index (bug, since fixed — see NOTES.md) — if touching Post schema, check for reintroducing duplicate indexes.

Config: `src/config/env.js` centralizes `process.env` reads (BOT_TOKEN, ADMIN_ID, CHANNEL_ID, MONGO_URI, ADMIN_PANEL_ORIGIN); `src/config/db.js` does the Mongoose connect.

Post moderation flow (bot → admin) is quiet-delete: rejecting a post notifies the user, but admin-deleting a post does not (deliberate, see NOTES.md). Deleting a post does NOT currently delete the corresponding Telegram channel message (open TODO in NOTES.md).