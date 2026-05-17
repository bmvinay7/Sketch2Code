# Deploying Sketch2Code to Vercel

Sketch2Code is designed as a fully serverless Next.js monolith. The Express backend has been entirely removed, and all heavy AI generation, streaming, and database operations run natively on Vercel Edge / Serverless functions.

Follow these steps to deploy the application to production.

## 1. Prepare Your Repository
Ensure all your code is committed and pushed to a Git repository (GitHub, GitLab, or Bitbucket).

## 2. Provision External Services
Vercel handles the compute, but you need to provision the managed services for state and AI:

1. **PostgreSQL Database** (e.g., [Neon](https://neon.tech), [Supabase](https://supabase.com), or Vercel Postgres)
   - Create a database and get your connection string.
   - Example: `postgresql://user:password@host/dbname`
2. **Upstash Redis** (for AI Cache and Rate Limiting)
   - Go to [Upstash](https://upstash.com), create a Redis database.
   - Copy the REST URL and REST Token.
3. **Google Gemini API**
   - Go to [Google AI Studio](https://aistudio.google.com/) and create an API Key.
4. **Clerk Authentication**
   - Go to [Clerk](https://clerk.com), create an application.
   - Add your Vercel production domain to the Clerk instance.
   - Note the Publishable Key and Secret Key.

## 3. Import Project on Vercel
1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New... > Project**.
3. Import your Sketch2Code GitHub repository.
4. Vercel will automatically detect the **Next.js** framework.

## 4. Configure Environment Variables
Before clicking Deploy, open the **Environment Variables** section and add the keys from your `.env.example`:

| Key | Example / Description |
| :--- | :--- |
| `DATABASE_URL` | Your Postgres connection pool URL. |
| `DIRECT_URL` | Your direct Postgres URL (required for Prisma migrations if using PgBouncer). |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | From Clerk Dashboard. |
| `CLERK_SECRET_KEY` | From Clerk Dashboard. |
| `CLERK_WEBHOOK_SECRET` | Required if you set up Clerk webhooks (syncs users to DB). |
| `GEMINI_API_KEY` | Your Google Gemini API Key. |
| `UPSTASH_REDIS_REST_URL` | From Upstash console. |
| `UPSTASH_REDIS_REST_TOKEN` | From Upstash console. |

## 5. Build and Deploy
1. Click **Deploy**.
2. **Important Notes on the Build Process**:
   - Vercel will automatically run `npm install`.
   - Your `package.json` contains a `postinstall: "prisma generate"` script, which automatically generates the Prisma Client before the Next.js build runs. You don't need to configure a custom build command.
   - Because we use `vercel.json`, your AI streaming API routes (`/api/stream`, `/api/analyze`, `/api/trace`, etc.) are automatically configured to bypass the 10-second default timeout and will execute with a `60s` maximum duration limit.

## 6. Post-Deployment (Database Sync)
Once deployed, Vercel does not automatically push your database schema to your Postgres instance. You must sync it manually.

Run this locally from your terminal, replacing the URL with your production database URL:
```bash
DATABASE_URL="your-production-postgres-url" npx prisma db push
```

## 7. Webhook Configuration (Optional but Recommended)
To ensure user avatars and emails stay perfectly synced when users sign up via Clerk:
1. Go to Clerk Dashboard > Webhooks.
2. Add an Endpoint pointing to `https://your-vercel-domain.com/api/webhooks/clerk`.
3. Subscribe to the `user.created` event.
4. Copy the Webhook Signing Secret into your Vercel Environment Variables as `CLERK_WEBHOOK_SECRET`.
5. Redeploy your Vercel app to apply the new variable.

You're done! Your Sketch2Code platform is live and fully serverless.
