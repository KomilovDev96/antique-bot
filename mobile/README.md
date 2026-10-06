# Mobile Antique AI

Expo/React Native client for the existing Pulmatik antique collection and marketplace backend. The app covers authenticated collection management, gold and silver marketplace listings, camera/image identification, request workflows, notifications, and an owner-scoped collection assistant.

## Development

```bash
npm install
npm run start
npm run typecheck
npm run lint
npm test -- --run
npx expo export --platform all
```

Set `EXPO_PUBLIC_API_URL` in a local `.env` to the Pulmatik API base URL. Never place provider credentials in Expo variables: mobile bundles are public. Claude is configured server-side in Pulmatik and the mobile client only calls authenticated backend endpoints.

## Claude integration

`server-integration/claude-provider.ts` is intentionally server-only. It validates structured JSON responses with Zod, supports up to five bounded images, enforces response budgets, records token usage, and scopes collection answers to the authenticated owner’s database evidence. The production Pulmatik `aiFallback` row stores the Claude credential encrypted with the backend `ENCRYPTION_KEY`.

## Token-efficient code navigation

The project includes project-scoped Graphify and Serena configuration. Graphify’s code graph is in `graphify-out/`; refresh it after source changes with:

```bash
graphify update . --no-cluster
```

Serena is configured in `.codex/config.toml` and its symbol index can be refreshed with `serena project index .`.
