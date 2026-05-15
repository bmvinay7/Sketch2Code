# Sketch2Code

Sketch2Code is a visual algorithm intelligence workspace. It converts whiteboard logic, flowcharts, and algorithm sketches into structured code, reusable study artifacts, and shareable community workspaces.

The product is built as a canvas-first platform: users sketch logic in Excalidraw, generate code with Gemini, save the full board state to their profile, and publish selected workspaces into a public feed where others can view, comment, save, vote, and remix.

## Features

- Canvas workspace built on Excalidraw with saved scene snapshots.
- Gemini-powered code streaming and algorithm critique.
- Auto-derived problem context from readable board labels.
- Authenticated user library with saved workspaces.
- Public community feed with read-only board previews.
- Post detail pages with comments, votes, saves, and remix flow.
- Light and dark theme support through a shared Context provider.
- Vercel-ready Next.js App Router API routes.
- Optional Upstash Redis cache for repeated AI generations.

## Tech Stack

- Next.js App Router
- TypeScript
- TailwindCSS
- Framer Motion
- Lucide Icons
- Clerk authentication
- Prisma ORM
- PostgreSQL
- Excalidraw
- Google Gemini API
- Upstash Redis, optional

## Setup

1. Install dependencies.

```bash
npm install
```

2. Create local env file.

```bash
cp .env.local.example .env.local
```

3. Fill required env variables.

```bash
DATABASE_URL="postgresql://..."
GEMINI_API_KEY="..."
```

4. Generate Prisma client.

```bash
npx prisma generate
```

5. Push schema in local development.

```bash
npx prisma db push
```

6. Start the app.

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

## Environment Variables

`DATABASE_URL`: PostgreSQL connection string from Neon, Supabase, Vercel Postgres, or another hosted Postgres provider.

`GEMINI_API_KEY`: Google Gemini API key used by `/api/stream` and `/api/analyze`.

`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk publishable key for auth.

`CLERK_SECRET_KEY`: Clerk secret key for server-side auth.

`CLERK_WEBHOOK_SECRET`: Clerk webhook signing secret. Optional locally because API writes also upsert the current user.

`UPSTASH_REDIS_REST_URL`: Optional Upstash REST URL for AI response caching.

`UPSTASH_REDIS_REST_TOKEN`: Optional Upstash REST token for AI response caching.

`DISABLE_AUTH`: Optional local development escape hatch.

## Architecture

The frontend and backend run inside the Next.js app. API routes handle AI generation, analysis, persistence, publishing, voting, saving, comments, and remixing.

Core paths:

- `app/(marketing)/page.tsx`: product landing page.
- `app/canvas/[id]/page.tsx`: workspace route.
- `components/canvas/CanvasWorkspace.tsx`: workspace orchestration and persistence.
- `components/canvas/FlowCanvas.tsx`: Excalidraw mounting and scene capture.
- `components/code/CodePanel.tsx`: code stream and analysis display.
- `app/community/page.tsx`: public artifact feed.
- `app/community/[postId]/page.tsx`: read-only artifact detail.
- `app/profile/page.tsx`: private library and public feed access.
- `app/api/stream/route.ts`: streaming code generation.
- `app/api/analyze/route.ts`: algorithm critique.
- `app/api/flowcharts/[id]/route.ts`: save and restore workspaces.
- `prisma/schema.prisma`: relational data model.

## Folder Structure

```text
app/
  (marketing)/
  api/
  canvas/
  community/
  profile/
components/
  analysis/
  canvas/
  code/
  community/
  layout/
  theme/
  ui/
lib/
  ai-cache.ts
  auth-user.ts
  community.ts
  community-comments.ts
  flowcharts.ts
  prisma.ts
  redis.ts
prisma/
  schema.prisma
  seed.ts
```

## Screenshots

Reference screenshots live in `Screenshots/`. They document the previous broken states and should be replaced with final captures before release.

Expected final captures:

- Landing page
- Workspace
- Community feed
- Community post
- Profile

## Deployment

The app targets Vercel. Use a hosted PostgreSQL database, set all required environment variables, run Prisma generation during install, and deploy the Next.js app as a standard Vercel project.

See `vercel-deploy.md` for the production checklist.

## Roadmap

- True drag resizing between workspace panes.
- Shareable public workspace URLs with granular permissions.
- Better generated Excalidraw thumbnails stored at publish time.
- Language-specific code runners and test traces.
- Activity notifications for comments/remixes.
- Team spaces and collaborative sessions.
- Search indexing for algorithm tags and generated code.
