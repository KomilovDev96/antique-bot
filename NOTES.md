# Antique Bot / Admin Panel – quick notes

## Контекст и статус
- Backend: Node/Express + Mongo, путь `src/`.
- Bot: Telegraf, сервисы в `src/bot/services`.
- Admin panel: React/Vite в `admin-panel/`.
- Auth: JWT; при 401 на фронте админки токен чистится и редирект на `/login`.

## Недавние изменения
- Убрали дублирующий индекс `uniqueCode` в `Post` (остался `unique: true` в поле).
- API `DELETE /admin/posts/:id` теперь удаляет пост без уведомления пользователя; уведомление отправляется только при `reject`.
- Admin UI: фильтр статусов, сортировка по дате (новые/старые), кнопка удаления, бейдж новых (pending) постов в сайдбаре.
- Прежний баг: JWT expired → фронт перекидывает на логин.

## Ключевые файлы
- Модели: `src/models/Post.js`, `Estimate.js`, `Order.js`.
- Admin API: `src/api/routes/admin.routes.js`, `src/api/controllers/admin.controller.js`.
- Bot уведомления: `src/bot/services/admin.service.js`, `post.service.js`.
- Admin panel страницы: `admin-panel/src/pages/Dashboard.jsx`, `Posts.jsx`, `Estimates.jsx`, `Orders.jsx`.
- Axios клиент с авто-logout: `admin-panel/src/api/axiosClient.js`.

## TODO / идеи
- Для reject/approve/sold оставить уведомления, но удаление — тихое (уже так).
- При необходимости: удалять сообщения из TG-канала при удалении поста (сейчас не делаем).
- Маска/валидация телефона в формах, если нужно.
- Дополнить сидбар индикаторами для других сущностей (estimates/orders) при необходимости.

## Быстрые команды
- Backend dev: `npm run dev`
- Admin panel dev: `npm run dev --prefix admin-panel`
- Lint admin panel: `npm run lint --prefix admin-panel`
