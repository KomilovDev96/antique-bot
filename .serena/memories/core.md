Antique Bot: Telegram bot (Telegraf) + Express REST API + React admin panel, backed by MongoDB.

Single live entrypoint: `app.js` (CommonJS) — connects DB (`src/config/db.js`), launches bot (`src/bot`), mounts API router (`src/api`) at `/api`.

**Dead/legacy code — do not edit expecting effect**: `src/index.js`, `src/db.js`, `src/routes/*`, `src/middleware/authMiddleware.js`, `src/server/*` are an older parallel implementation, never required from `app.js`. Root-level `tmp.txt`, `tmp_est.js`, `tmp_estctrl.js` are scratch/staging copies of real files, also unwired.

Security: `env.local` (secrets: BOT_TOKEN, MONGO_URI, JWT_SECRET, ADMIN_PASSWORD, ADMIN_USERNAME) is tracked in git — `.gitignore` excludes `.env`/`.env.*` but not the no-dot `env.local` name. Flag before any push/PR involving this file.

More: `mem:tech_stack`, `mem:suggested_commands`, `mem:conventions`, `mem:task_completion`, `mem:backend/core` (live API + bot structure), `mem:frontend/core` (admin-panel).