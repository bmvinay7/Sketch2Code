# Sketch2Code

Sketch2Code is a Next.js app that turns Excalidraw algorithm diagrams into streamed code, saved canvases, and community posts.

## Local Setup

1. Copy `.env.example` to `.env.local`.
2. Set `DATABASE_URL` to a hosted Postgres database. Supabase or Neon both work with the existing Prisma schema.
3. Set `GEMINI_API_KEY` for code generation.
4. Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` for speculative streaming cache. The app falls back to in-memory cache locally.
5. Set Clerk keys for authentication. `CLERK_WEBHOOK_SECRET` is only required when using Clerk webhooks.

```bash
npm install
npm run prisma:generate
npm run dev
```

## Vercel Checklist

- Add every key from `.env.example` in the Vercel dashboard.
- Use the same hosted Postgres `DATABASE_URL` that Prisma can reach from Vercel.
- Use Upstash Redis REST credentials for streaming cache.
- Keep all API behavior in `app/api/...` route handlers. The SSE endpoint is `app/api/canvas/analyse/stream/route.ts`.
- Run `npm run build` before deployment.
