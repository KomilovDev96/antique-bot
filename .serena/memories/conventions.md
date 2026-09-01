Backend is CommonJS throughout (`require`), even though `admin-panel/` is ESM — don't mix `import` into root `src/`.

Bot logic (`src/bot/`) is organized by role, not by feature: `actions/` (inline button callbacks), `commands/` (slash commands), `flows/` (multi-step wizards, e.g. estimate/sell/buy), `handlers/` (message-type dispatch, wired in `src/bot/handlers.js`), `keyboards/`, `scenes/` (Telegraf scenes), `services/` (business logic shared between bot and API), `utils/` (image download, watermark, escapeHtml — `escapeHtml` and `downloadImageBuffer` are the most-referenced utilities in the bot, per `graphify-out/GRAPH_REPORT.md`).

API layer (`src/api/`) is layered `routes/` → `controllers/`, with `middlewares/auth.middleware.js` for JWT checks — mirrors the naming of the dead `src/server/` and `src/routes/` (see `mem:core`), don't confuse them.

`NOTES.md` at repo root is a hand-maintained Russian-language running dev log (recent changes, key files, TODOs) — read it for the "why" behind recent changes, and update it when making notable changes, matching existing style.

A `graphify-out/` knowledge graph of this repo exists (nodes/edges over code + NOTES.md); `graphify-out/GRAPH_REPORT.md` has god-node/community analysis useful for spotting hot files before a refactor.