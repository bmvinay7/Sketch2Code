# Vercel Deployment Guide

This project is designed to deploy as a single Next.js application on Vercel. The old separate Express backend is not required for the main product flow.

## 1. Prepare Services

Create these services before deploying:

- PostgreSQL database: Neon, Supabase, Vercel Postgres, or another hosted provider.
- Clerk application for auth.
- Google Gemini API key.
- Upstash Redis database, optional but recommended for AI caching.

## 2. Vercel Project Setup

1. Import the Git repository into Vercel.
2. Framework preset: `Next.js`.
3. Root directory: repository root.
4. Install command: `npm install`.
5. Build command: `npm run build`.
6. Output directory: leave default.

## 3. Environment Variables

Set these in Vercel Project Settings -> Environment Variables.

Required:

```bash
DATABASE_URL=postgresql://...
GEMINI_API_KEY=...
```

Required for production auth:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
```

Recommended:

```bash
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

Optional:

```bash
CLERK_WEBHOOK_SECRET=whsec_...
DISABLE_AUTH=false
```

Do not set `DISABLE_AUTH=true` in production.

## 4. Database Migration

For first deployment, push the Prisma schema to the production database:

```bash
npx prisma db push
```

For a team production workflow, replace direct pushes with migrations:

```bash
npx prisma migrate dev --name init
npx prisma migrate deploy
```

Vercel runs `postinstall`, which executes:

```bash
prisma generate
```

## 5. Clerk Configuration

Set the production app URL in Clerk:

```text
https://your-domain.com
```

Recommended redirect URLs:

```text
https://your-domain.com
https://your-domain.com/sign-in
https://your-domain.com/sign-up
https://your-domain.com/profile
```

Webhook endpoint:

```text
https://your-domain.com/api/webhooks/clerk
```

The app also upserts users during authenticated writes, so the webhook is useful but not the only user sync path.

## 6. Runtime Guidance

Use the default Node.js runtime for API routes that use Prisma and Gemini.

Do not force Edge runtime for:

- `/api/stream`
- `/api/analyze`
- `/api/flowcharts/*`
- `/api/community/*`

Prisma works most reliably in Node runtime unless a dedicated edge-compatible driver setup is added.

## 7. Optimization Settings

Recommended Vercel settings:

- Enable automatic deployments from main.
- Enable preview deployments for pull requests.
- Keep build cache enabled.
- Use the closest database region to the Vercel deployment region.
- Use Upstash Redis in the same broad region as Vercel.

The UI avoids remote font downloads during build by using system font stacks.

## 8. Image and Asset Notes

Excalidraw snapshots are currently stored as serialized JSON. Uploaded Excalidraw files are stored inside the snapshot `files` object.

For larger production usage:

- Move large embedded images to object storage.
- Store generated thumbnails for community cards.
- Add `next/image` for any external marketing images.
- Configure `images.remotePatterns` if avatar providers or CDN image domains need optimization.

## 9. Domain Setup

1. Add your production domain in Vercel.
2. Configure DNS records as Vercel instructs.
3. Add the same domain to Clerk allowed origins and redirect URLs.
4. Update any marketing metadata URLs if needed.

## 10. Production Checklist

- `npm run type-check` passes.
- `npm run build` passes.
- `DATABASE_URL` points to production Postgres.
- `GEMINI_API_KEY` is valid.
- Clerk publishable and secret keys are production keys.
- `DISABLE_AUTH` is not enabled.
- Prisma schema is pushed or migrations deployed.
- Community feed loads published posts.
- Canvas save and restore work for an authenticated user.
- Publish, save, vote, comment, and remix routes work.
- Read-only Excalidraw previews render in feed and post pages.
- Light/dark theme toggle works.
- Mobile, laptop, and wide desktop layouts have no horizontal overflow.
