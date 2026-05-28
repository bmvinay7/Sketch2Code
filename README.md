# Sketch2Code

Draw your algorithm. Watch it become code.

A faithful flowchart-to-code workspace for DSA learners. Photograph or sketch a flowchart, the app preprocesses it with **Otsu's thresholding** in the browser, then **Gemini 2.5 Flash** streams code that translates the diagram *exactly as drawn* — bugs and all. The point is to make wrong logic visible as wrong code, so students can see the gap and fix it.

**Live:** [sketch2code-ten.vercel.app](https://sketch2code-ten.vercel.app)

## What's interesting in here

| Piece | Where |
|---|---|
| **Otsu's method** (1979 binarisation), pure-TS implementation with docstring | [`lib/otsu.ts`](lib/otsu.ts) |
| Streaming Gemini → SSE → React, via Next 15 `ReadableStream` | [`app/api/stream/route.ts`](app/api/stream/route.ts) + [`lib/gemini.ts`](lib/gemini.ts) |
| Model fallback chain — auto-retries across `gemini-2.5-flash → 2.5-flash-lite → 2.0-flash` on quota / overload | [`lib/gemini.ts`](lib/gemini.ts) |
| Self-healing user sync — no Clerk webhook needed | [`lib/currentUser.ts`](lib/currentUser.ts) |
| "Draftsman's console" UI — IBM Plex Sans + JetBrains Mono + Instrument Serif | [`app/globals.css`](app/globals.css) + [`tailwind.config.ts`](tailwind.config.ts) |

## Stack

- **Next.js 15** (App Router) + **React 19** on Vercel
- **Postgres** on Neon (free tier) via Prisma
- **Clerk** for auth (free tier)
- **Gemini 2.5 Flash** for vision + code generation
- No Redis, no separate backend, no Docker — single Vercel deployment

## Local development

```bash
# 1. Install
npm install

# 2. Copy env template, fill in keys
cp .env.local.example .env.local

# 3. Apply Prisma schema to your Postgres
npx prisma migrate dev

# 4. Run
npm run dev
# → http://localhost:4000
```

Set `DISABLE_AUTH=true` in `.env.local` to bypass Clerk for local dev — the app uses a deterministic `local-dev-user` row instead.

## Env vars

| Var | Required for | Notes |
|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Auth | Clerk dashboard → API keys |
| `CLERK_SECRET_KEY` | Auth | Same place |
| `DATABASE_URL` | DB | Neon pooled DSN |
| `DIRECT_DATABASE_URL` | Migrations | Neon non-pooled DSN — Prisma migrate needs this |
| `GEMINI_API_KEY` | Stream + analyze | aistudio.google.com |
| `DISABLE_AUTH` | Dev only | Set to `true` to skip Clerk locally |
| `RATE_LIMIT_PER_HOUR` | Optional | Per-user limit on /api/stream + /api/analyze (default 60) |

## Architecture notes

- **`/api/stream`** uses native `ReadableStream` rather than the Express SSE wrapper we started with — Vercel's `experimentalServices` buffers Express responses and silently breaks SSE.
- **In-memory rate limit** at [`lib/rateLimit.ts`](lib/rateLimit.ts) — survives within a Vercel instance but resets on cold start. Good enough for a demo; upgrade to Upstash if you ever care about real abuse prevention.
- **Otsu runs client-side** — the binarised PNG is what gets uploaded, not the original photo. Strips paper texture and lighting gradients before Gemini sees them.

## License

MIT.
