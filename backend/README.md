# Forkcast Backend

REST API for [Forkcast](../README.md). Express 5 + SQLite (better-sqlite3), JWT auth,
and Spoonacular as the upstream recipe source.

## Tech Stack

- **Express 5** — HTTP server and routing
- **better-sqlite3** — embedded SQLite database (`forkcast.db`, auto-created on first run)
- **jsonwebtoken** + **bcrypt** — auth and password hashing
- **express-validator** — request validation
- **express-rate-limit** — global rate limiting + per-user Spoonacular quota
- **nodemailer** + **mustache** — email verification & password-reset mails (i18n templates)
- **swagger-ui-express** + **yamljs** — API docs from `src/public/swagger.yaml`
- **tsx** — run TypeScript directly (no build step)

## Environment Setup

Copy `example.env` to `.env` and fill in the values:

```bash
cp example.env .env
```

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default `3000`) |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRY` | Token lifetime, e.g. `1h` |
| `SPOONACULAR_API_KEY` | API key for the Spoonacular recipe service |
| `CACHE_TTL_MS` | How long cached remote recipes live (`1s`/`1m`/`1h`/`1d`) |
| `FRIEND_REQUEST_TTL_MS` | Lifetime of a pending friend request |
| `VERIFICATION_CODE_TTL_MS` | Lifetime of signup email / password-reset codes |
| `CORS_ORIGIN` | Allowed origin(s), comma-separated |
| `RATE_LIMIT_WINDOW_MS` | Rate-limit window in ms (e.g. `900000` = 15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per IP per window |
| `EMAIL_HOST` / `EMAIL_PORT` / `EMAIL_SECURE` / `EMAIL_USER` / `EMAIL_PASS` | SMTP config for outgoing mail (optional) |

## Running

```bash
npm install
npm start        # tsx src/app.ts — starts on http://localhost:$PORT
npm run dev      # nodemon, restarts on change
npm test         # jest test suite
```

On startup the server creates the SQLite database and tables if missing, seeds filter
data, warms the filter cache, and schedules periodic cleanup of expired cached recipes
and friend requests.

## API Documentation

Interactive Swagger UI at `http://localhost:3000/api-docs` once the server is running.

## Project Structure

```
src/
├── app.ts              # entry point: middleware, route mounting, cleanup jobs
├── config.ts           # TTL constants parsed from env
├── routes/             # Express routers per domain
├── services/           # business logic
├── repository/         # SQLite data access (incl. remote Spoonacular repo)
├── middleware/         # auth, validation, API quota limiter
├── db/                 # schema/unit, filter seeding
├── templates/          # email templates (mustache)
├── locales/            # email i18n strings
└── public/swagger.yaml # API spec
```

## Docker

A `Dockerfile` is provided; CI publishes an image to `ghcr.io/<owner>/forkcast-backend`
on changes under `backend/` (see `.github/workflows/backend-docker.yml`).
