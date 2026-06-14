# Forkcast Frontend

Nuxt 4 client for [Forkcast](../README.md). A static, statically-generated SPA that
consumes the [backend REST API](../backend/README.md) and is deployed to GitHub Pages.

## Tech Stack

- **Nuxt 4** (Vue 3) — static site generation (`nuxt generate`)
- **Pinia** + `pinia-plugin-persistedstate` — state; JWT persisted in `sessionStorage`
- **TailwindCSS 4** + **DaisyUI** — styling
- **@nuxtjs/i18n** — 9 locales, including RTL (Arabic, Hebrew)
- **@nuxt/image** — image optimization
- **@nuxtjs/mdc** — render Markdown content (legal pages)
- **vuedraggable** — drag-and-drop meal calendar
- **pikaday** — date picking

## Setup

```bash
npm install
```

### Environment

The only config is the backend API base URL, read at runtime:

| Variable | Default | Description |
|----------|---------|-------------|
| `API_BASE_URL` | `http://localhost:3000/api` | Backend REST API base URL |

```bash
# dev server on :8080 (matches the backend's default CORS_ORIGIN);
# API_BASE_URL defaults to http://localhost:3000/api
npm run dev -- --port 8080
```

## Scripts

```bash
npm run dev        # dev server with HMR (defaults to :3000 — pass --port 8080)
npm run generate   # static site → .output/public (used for Pages deploy)
```

## How Auth Works

The dashboard is client-only. Auth is resolved on the client before the app mounts:

- `plugins/auth.client.ts` loads the user from a stored JWT and redirects the initial route.
- `middleware/auth.global.ts` guards client-side navigations (server can't see `sessionStorage`).
- `plugins/auth-expiry.client.ts` registers a handler the API connector fires on any
  `401/403`: it logs out, clears cached stores, and bounces off protected routes.

Because of this, `/dashboard/**` routes are configured with `ssr: false` and prerendering
disabled (see `nuxt.config.ts`) to avoid hydration mismatches.

## Project Structure

```
app/
├── pages/              # routes (index, auth/*, dashboard/*, legal/company pages)
├── components/         # UI components (navbar, recipe cards, calendar, modals, ...)
├── layouts/            # default layout
├── middleware/         # auth.global route guard
├── plugins/            # client auth resolution & expiry handling
├── content/            # Markdown legal pages (terms, privacy, cookies)
└── assets/
    ├── model/          # TypeScript types (User, RecipePreview, Filter, ...)
    ├── store/          # Pinia stores (auth, recipe, calendar, favorites)
    ├── service/        # auth & friend services over the API
    ├── util/           # api-connector, auth-expiry, failure handling
    └── css/            # tailwind + animations + app styles
i18n/locales/           # translation files (en, de, es, zh, fr, tr, ar, ja, he)
server/api/             # get-content (serves Markdown content)
public/                 # static assets (logos, images)
```

## Deployment

`.github/workflows/deploy-nuxt.yaml` runs `npm run generate` and publishes
`.output/public` to GitHub Pages on every push to `main`. The app is served under the
base path `/sommerprojekt-wmc-forkcast` (set in `nuxt.config.ts`).
