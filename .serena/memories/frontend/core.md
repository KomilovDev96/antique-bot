`admin-panel/` is a standalone Vite/React app, own `package.json`/`node_modules`, not part of the root npm workspace — always run its scripts with `--prefix admin-panel` or `cd` into it.

Auth: JWT stored client-side; `admin-panel/src/api/axiosClient.js` is the single axios instance — on a 401 response it clears the stored token and redirects to `/login` (auto-logout, fixes a prior "expired token leaves user stuck" bug — see NOTES.md). Any new API call should go through this client, not a fresh axios instance, to keep that behavior.

Routing gated by `admin-panel/src/components/PrivateRoute.jsx`. Pages (`src/pages/`): `Dashboard`, `Posts` (status filter, date sort, delete, pending badge), `Estimates`, `Orders`, `Login`.

Backend CORS in root `app.js` whitelists `ADMIN_PANEL_ORIGIN` env var plus `localhost:5173`/`127.0.0.1:5173` (Vite's default dev port) — if the panel is served from a different port/host, add it there.