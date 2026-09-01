Backend (repo root): Node.js, CommonJS (`require`/`module.exports`, no ESM). Express 5, Mongoose 8 (MongoDB), Telegraf 4 + telegraf-session-local (bot), jsonwebtoken (JWT auth), sharp + jimp (image/watermark/collage processing), axios, cors, dotenv. Dev-only: nodemon.

Frontend (`admin-panel/`): separate npm package, ESM (`"type": "module"`), React 19 + Vite 7, antd 5 (UI kit), @tanstack/react-query 5, react-router-dom 7, axios. ESLint 9 flat config (`eslint.config.js`) — plugins: react-hooks, react-refresh.

No test framework configured in either package.