# Mobile API

The mobile client uses the isolated `/api/mobile/v1` namespace. Existing Telegram and admin routes remain unchanged.

## Authentication

Mobile accounts use a Gmail address and password. Registration returns an access token and a rotating refresh token immediately; there is no Google OAuth flow and no email verification step in this first mobile release.

```text
POST /api/mobile/v1/auth/register { email, password, name? }
POST /api/mobile/v1/auth/login    { email, password }
POST /api/mobile/v1/auth/refresh  { refreshToken }
GET  /api/mobile/v1/auth/me       Authorization: Bearer <accessToken>
POST /api/mobile/v1/auth/logout   Authorization: Bearer <accessToken>
```

Passwords are hashed with Node's `scrypt`; refresh tokens are stored only as SHA-256 hashes. Use the existing `JWT_SECRET` in `env.local` and do not put credentials in the Expo bundle.

The first API slice includes categories, profile, collection, marketplace listings, metal quote/valuation responses, media uploads, purchase/inspection requests, identification job tracking, notifications, and the assistant endpoint contract. Claude identification and assistant generation return an explicit unavailable response until a Claude key is configured for this backend.

Run the backend with Docker from this directory:

```bash
docker compose up -d mongo backend
```

The phone should point `EXPO_PUBLIC_API_URL` at the computer's LAN address, for example `http://192.168.1.20:5050/api/mobile/v1`.
