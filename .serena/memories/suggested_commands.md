Backend dev (from repo root): `npm run dev` — nodemon, watches only `src/` (see `nodemon.json`) plus `.js`/`.json` ext; editing `app.js` itself requires a manual restart, nodemon won't pick it up.
Backend prod: `npm start` (`node app.js`).

Admin panel dev: `npm run dev --prefix admin-panel` (Vite, default port 5173 — already whitelisted in `app.js` CORS origins).
Admin panel build: `npm run build --prefix admin-panel`.
Admin panel lint: `npm run lint --prefix admin-panel`.

No backend lint/test script exists — `npm test`/`npm run lint` at root will fail (not defined).