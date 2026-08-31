# Qualms

SvelteKit app on Cloudflare Workers, with WorkOS AuthKit and Postgres.

## Prerequisites

- Node.js with npm 11+
- Homebrew `postgresql@18` (already the local default for this repo)
- A WorkOS Staging (sandbox) API key

## First-time setup

```sh
npm install
```

Generate a cookie password:

```sh
openssl rand -base64 32
```

Create `.env.local` at the repo root, filling in your Staging `WORKOS_API_KEY` and the generated cookie password:

```ini
DATABASE_URL=postgresql://qualms:qualms@localhost:5432/qualms_dev
WORKOS_CLIENT_ID=client_01M127YPG8YCGC29WCDWE36ANJ
WORKOS_API_KEY=
WORKOS_REDIRECT_URI=http://localhost:5173/callback
WORKOS_COOKIE_PASSWORD=
```

Create `apps/web/.dev.vars` with the same WorkOS values. Wrangler cannot read `.env` files, and it gets the database from the Hyperdrive binding in `wrangler.jsonc` rather than `DATABASE_URL`:

```ini
WORKOS_CLIENT_ID=client_01M127YPG8YCGC29WCDWE36ANJ
WORKOS_API_KEY=
WORKOS_REDIRECT_URI=http://localhost:5173/callback
WORKOS_COOKIE_PASSWORD=
```

Use the same API key and cookie password in both files, then:

```sh
npm run db:up
npm run db:schema
```

`http://localhost:5173/callback` is already registered as a Staging AuthKit redirect URI.

## Environment variables

| Variable | Used by | Notes |
| --- | --- | --- |
| `DATABASE_URL` | Vite (`npm run dev`) and Drizzle | Local default: `postgresql://qualms:qualms@localhost:5432/qualms_dev` |
| `WORKOS_CLIENT_ID` | Vite and Wrangler | Staging client ID is public; the value is in the setup snippets above |
| `WORKOS_API_KEY` | Vite and Wrangler | Secret. Copy from the Staging environment in the WorkOS dashboard |
| `WORKOS_REDIRECT_URI` | Vite and Wrangler | `http://localhost:5173/callback` for local Vite |
| `WORKOS_COOKIE_PASSWORD` | Vite and Wrangler | At least 32 characters |

`.env.local` at the repo root feeds both Vite and `drizzle-kit`. `apps/web/.dev.vars` feeds `wrangler dev`. Neither file is committed.

## Run locally

Vite, with a direct `DATABASE_URL` connection:

```sh
npm run dev
```

Open `http://localhost:5173`, then `/sign-in` to go through WorkOS and land on `/dashboard`.

Workers-runtime preview, with Hyperdrive pointed at the same local database:

```sh
npm run preview
```

Sign-in is verified on `npm run dev`. Preview is for exercising the Cloudflare adapter and Hyperdrive binding before a deploy.

## Database commands

| Script | What it does |
| --- | --- |
| `npm run db:up` | Start Homebrew `postgresql@18` |
| `npm run db:down` | Stop Homebrew `postgresql@18` |
| `npm run db:schema` | Push the Drizzle schema to `qualms_dev` |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run db:reset` | Drop and recreate `qualms_dev`, then push the schema |

## Checks

```sh
npm run lint
npm run typecheck
npm run test
```

## Deploy

```sh
npm run deploy
```
