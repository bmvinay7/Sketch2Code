# MASTER AGENT PROMPT — Full-Stack Redesign & Feature Sprint

> **Before doing anything else:** Read every file inside `.agent/` directory in the project root.
> Then read `design.md` in the project root. These two sources are the **law** for all UI decisions.
> Do not skip this step — every component you touch must comply with both.

---

## PHASE 0 — Codebase & Database Reconnaissance (Do this first, touch nothing)

0.1 Walk the entire project tree. Map every route, page, component, hook, util, and API route. Write a brief mental model of the data flow before touching code.

0.2 Inspect the database schema in full — tables/collections, relationships, indexes, and any seed data. Understand what is stored, what is derived, and what is missing.

0.3 Read and understand every existing Excalidraw integration in the codebase — how it is initialised, how scene data is serialised/deserialised, and how it is currently embedded. You will need this for Tasks 3 and 2.3.

0.4 Locate `Screenshots/Landing-reference.jpg` in the project. This image is the **layout and section-structure reference for the Landing Page only**. Use it for compositional decisions on the landing page, but apply `design.md` for all colours, typography, spacing tokens, and component styles — the screenshot drives layout, `design.md` drives execution.

0.5 For all other pages (Canvas, Community, Profile), existing screenshots of the current UI live in the `Screenshots/` folder. Use them only to understand current structure and pain points — do not replicate their aesthetic.

---

## PHASE 1 — Global Design System Application

Before redesigning any individual page, do the following once and propagate everywhere:

1.1 Implement all CSS custom properties from `design.md` §2 in the global stylesheet or Tailwind config. Every page and component must consume these tokens — zero hardcoded colour or spacing values anywhere.

1.2 Install and configure the fonts defined in `design.md` §3 (Syne + DM Sans + JetBrains Mono). Apply them globally. Remove any existing generic font references (Inter, Roboto, system-ui, Arial).

1.3 Add the dot-grid background texture from `design.md` §4 to the root layout. Ensure it is present on every page behind all content.

1.4 Install **Lucide React** if not already present. Audit every icon in the project and replace with Lucide outline equivalents at `stroke-width: 1.5`. Remove any other icon libraries.

1.5 Implement a **theme toggle** (light / dark) that switches the `:root.dark` token set from `design.md` §10. Persist the preference to `localStorage`. The toggle must be present in every navbar.

1.6 Define a `<FloatingShapes />` component that renders 2–3 positioned geometric shapes using `--color-pop-*` tokens per `design.md` §5. It will be used in hero sections and empty states.

1.7 Define base animation utilities per `design.md` §9: `fadeUp` keyframe, staggered load class helpers, and hover transition defaults. Apply `transition: all 0.15s ease` to all interactive elements globally.

---

## PHASE 2 — Page Redesigns

### 2.1 Landing Page

**Reference:** `Screenshots/Landing-reference.jpg` — match its section layout and content density. Use `design.md` for all visual execution.

**Mandatory fixes and directives:**

**Navbar:**
- Tighten the navbar — it should feel dense and purposeful, not airy.
- Merge the separate profile section and Clerk profile into one unified user menu: a single avatar/pill that opens a dropdown with account actions. No duplicate profile UI.
- Add the light/dark toggle from Phase 1.6 into the nav.
- Nav links: `opacity: 0.75` at rest, `opacity: 1` on hover, no underline, sentence case.
- CTA button in nav: pill-shaped primary button per `design.md` §7.2.

**Hero Section:**
- Follow the layout in `Landing-reference.jpg` for content arrangement.
- Headline: large, mixed-colour per `design.md` §7.9 — first accent phrase in `--color-accent`, rest in `--color-text-primary`. Make the copy sharp, specific, and benefit-led — no filler words.
- Replace "Try the Demo" → **"Try Now"** across all CTAs.
- Kill all passive, vague copy ("explore", "discover", "welcome to"). Rewrite every headline and subheading to be active, outcome-focused, and premium-feeling. Treat every word like it costs money.
- Add `<FloatingShapes />` behind the hero.
- Add staggered `fadeUp` animation on hero elements (badge → headline → subheading → CTA), 60ms between each.

**Terminal Component:**
- Remove the current terminal component entirely.
- Replace it with a **live animated code window**: a macOS-style window chrome (3 coloured dots, dark surface), with syntax-highlighted code that types itself out on loop using a typewriter animation. Use a code snippet that is actually relevant to what the product does.
- Use `highlight.js` or `Prism.js` for syntax colouring inside the mock terminal.
- The window should have subtle inner glow on the dark surface — `box-shadow: inset 0 1px 0 rgba(255,255,255,0.06)`.

**All Sections (global landing rules):**
- Eliminate all excessive whitespace. Section vertical padding: `clamp(60px, 8vw, 100px)` max — not more.
- Every section must have a strong headline, a sharp 1–2 line subheading, and a concrete visual or data point. No section can be just text.
- Feature cards: use the card spec from `design.md` §7.3 — border, no shadow, dark inversion on hover.
- Add scroll-triggered `fadeUp` animations on all section content as it enters the viewport — use `IntersectionObserver`.
- Add subtle number counters or statistics where relevant to convey scale/quality.

**Overall:** The landing page should feel like a premium SaaS product (think Linear, Vercel, Raycast). If it looks like it was generated in 60 seconds, rewrite it.

---

### 2.2 Canvas Page

**Mandatory fixes and directives:**

**Layout:**
- Remove the ugly gap between the top navbar and the canvas area. The canvas workspace should start immediately below the nav — zero dead space.
- The top bar of the canvas should be a tight, integrated toolbar row: `[Title (editable inline)] [Language Selector] [Save] [Analyse Canvas] [Upload Image]` — all in one horizontal bar flush to the top.
- Below the toolbar: full-height split layout — Excalidraw canvas on the left, code output panel on the right. No weird margins or offsets.

**Title & Save:**
- Add an inline-editable title field (click to edit, blur to confirm) at the top left. Placeholder: "Untitled Canvas".
- Add a **Save** button that saves the current canvas scene data + generated code + title to the authenticated user's profile. Show a toast on success/failure.
- If no Problem Context is provided by the user, **auto-generate it** by inferring context from the current Excalidraw scene — send the canvas snapshot to Gemini with a prompt like: *"Describe what DSA problem or algorithm this diagram represents in one sentence."* Use that as the context automatically.

**Language Selector:**
- Override the language selector's CSS to match `design.md` — pill-shaped dropdown, `--color-surface` background, `--color-border` border, `--color-accent` highlight on selection.
- **Expand supported languages** — add all of the following (these are the most used in DSA/competitive programming):
  `Python, C++, Java, JavaScript, TypeScript, Go, Rust, Kotlin, Swift, C, C#, Ruby, Scala, Dart, PHP`
- Group them in the dropdown: **Most Popular for DSA** (Python, C++, Java, Go) at the top, then the rest alphabetically.

**Analyse Canvas Button & Upload Image:**
- Move both buttons into the integrated toolbar row described above — they must not overflow or be weirdly positioned.
- "Analyse Canvas" → primary pill button, `--color-accent` fill.
- "Upload Image" → ghost pill button beside it.

**Excalidraw Theme:**
- Attempt to override Excalidraw's theme using its `theme` prop and CSS variable overrides. Target the Excalidraw container with:
  ```css
  .excalidraw { --color-primary: var(--color-accent); }
  .excalidraw .layer-ui__wrapper { background: var(--color-surface); }
  ```
- If full theme override is not achievable without breaking functionality, match the surrounding UI to Excalidraw's default palette instead — use Excalidraw's exact background and surface colours for the toolbar and panel so there is zero jarring seam between the canvas and the rest of the UI.

**Code Output Panel:**
- Use `react-syntax-highlighter` (or `highlight.js` React wrapper) to colour the generated code based on the selected language.
- The code panel should have:
  - A language badge (top right of panel)
  - Line numbers
  - A "Copy" icon button (Lucide `Copy`)
  - A dark surface background matching `design.md` dark palette
- Code streams in token-by-token via SSE (see Task 4 for the full streaming strategy). Show a blinking cursor at the stream head while streaming is in progress.

---

### 2.3 Community Page

**Mandatory fixes and directives:**

**Overall structure — Reddit-style:**
- Redesign the layout as a two-column feed: main feed (left, ~65% width) + sidebar (right, ~35% width).
- Feed items are cards per `design.md` §7.3 — compact, information-dense, no excessive padding.
- Sidebar: top contributors, trending tags, quick-post CTA. No tutorial tips, no "what is community" explainers — remove all of that entirely. Users know what a community is.

**Feed items:**
- Each post shows: author avatar + name, timestamp, problem title, tags, vote count, comment count, a preview of the Excalidraw canvas (read-only thumbnail — see below).
- Author names: pull from real user data. Remove all seeded AI-generated placeholder names. If no real users exist yet, use clearly fictional but human-sounding names — not AI clichés.

**Post Detail Page (when a community problem is opened):**
- Embed a **read-only Excalidraw canvas** for the problem's diagram. Use the same Excalidraw skill from `.agent/` and the existing canvas page integration — just pass `viewModeEnabled={true}` and `zenModeEnabled={true}` to the component and disable all editing UI.
- The embedded canvas should take up the full width of the content area, with a fixed height (e.g. `420px`), rounded corners (`border-radius: 16px`), and a border matching `design.md`.
- Below the canvas: problem description, code solution (syntax highlighted per 2.2), comments thread.
- The comment thread should feel like Reddit's — nested, with upvote/downvote per comment.

**Whitespace:**
- Left and right page padding must be constrained. Use the global max-width (`1100px`) centred. No side margins wider than `clamp(24px, 5vw, 60px)`.

---

### 2.4 Profile Page

**Mandatory fixes and directives:**

- Apply global max-width and remove excess horizontal padding.
- Layout: avatar + name + stats row at top (compact), then tabbed sections: **Saved Canvases | Community Posts | Activity**.
- Each saved canvas appears as a card with: canvas thumbnail (static Excalidraw preview), title, language badge, last modified date, and a "Open" button.
- **Community posts must be visible here** — Task 5 is executed here. Any canvas or post a user has submitted to the community is listed in their public profile under "Community Posts". This is a public view — other users can navigate to someone's profile and see their community contributions.
- No whitespace between sections. Use the tab switcher component from `design.md` §7.4.

---

## PHASE 3 — Excalidraw Read-Only Embeds in Community

This task is the implementation backing what 2.3 described.

3.1 Create a reusable `<ExcalidrawEmbed scene={sceneData} />` component that:
- Renders Excalidraw in `viewModeEnabled={true}`, `zenModeEnabled={true}`, `gridModeEnabled={false}`
- Hides the toolbar, sidebar, and all editing affordances via CSS
- Accepts a `height` prop (default `420px`)
- Shows a loading skeleton until the scene is hydrated

3.2 Store each community problem's Excalidraw scene JSON in the database alongside the problem record. When seeding/creating community problems, generate meaningful DSA diagrams (linked lists, trees, graphs, arrays, stacks, queues) — not blank canvases.

3.3 Use `<ExcalidrawEmbed />` on:
- Community post detail page (full-width embed)
- Community feed item cards (small thumbnail — fixed height `160px`, `pointer-events: none`)
- Profile page saved canvas cards (same thumbnail treatment)

---

## PHASE 4 — Gemini API — Progressive SSE with Redis Cache

This is a significant architecture change. Plan it fully before implementing.

### Strategy: Speculative Streaming

**Concept:** As the user draws on the Excalidraw canvas, Gemini is called speculatively in the background after every 2 shape additions. Each response is cached in Redis. When the user clicks "Analyse Canvas", the SSE stream begins by replaying cached output immediately (making it feel instant), while simultaneously requesting the final Gemini response with the complete canvas — which continues the stream where the cache left off.

### Implementation Plan:

**4.1 Shape-change listener:**
- Hook into Excalidraw's `onChange` callback. Maintain a counter of element additions.
- Every time `elementCount % 2 === 0 && elementCount > 0`, trigger a **background speculative API call**.
- Debounce this: if the user adds shapes very quickly, cancel the pending speculative call and restart the timer (300ms debounce).
- This call should be non-blocking — fire and forget into a background queue. Do not await it.

**4.2 Speculative API call:**
- Send a low-detail snapshot of the current canvas (element types + rough positions — not a full image render, to reduce latency) to Gemini with the prompt: *"Based on this partial DSA diagram, begin generating [language] code for the algorithm it likely represents. Output as much as you can confidently."*
- Response is a **partial/speculative code snippet** — not necessarily complete.
- Store this in Redis with key: `canvas:speculative:{sessionId}`, TTL 5 minutes.
- Each new speculative call **overwrites** the previous key — only the latest matters.

**4.3 "Analyse Canvas" click — SSE endpoint:**
- Client opens an `EventSource` to `GET /api/canvas/analyse/stream?sessionId={id}`.
- Server-side SSE handler:
  1. Immediately read `canvas:speculative:{sessionId}` from Redis.
  2. If cache exists: stream it token-by-token to the client immediately (simulates instant response). Mark a `cacheEnd` event when done.
  3. Simultaneously kick off the **full Gemini API call** with the complete canvas image + context.
  4. When Gemini starts responding, stream its tokens. If the full response begins overlapping with what the cache already sent, de-duplicate: track a character offset and only stream the delta from where the cache ended.
  5. Send a `done` SSE event when the full response is complete.
  6. Clear the Redis key.

**4.4 Client-side SSE handler:**
- Open `EventSource` on button click.
- On each `message` event: append the token to the code panel display.
- On `cacheEnd` event: show a subtle "refining…" indicator in the code panel header — user sees code appearing instantly, then a brief "refining" phase, then the complete version.
- On `done` event: close the `EventSource`, hide the indicator, show "Copy" button.
- Show a blinking cursor at the stream head throughout.

**4.5 Redis configuration:**
- Use `ioredis` or `upstash/redis` (prefer Upstash for Vercel compatibility — serverless-safe, HTTP-based).
- Add `REDIS_URL` (or `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`) to `.env`.

**4.6 Rate limiting:**
- Speculative calls: max 1 per 2 seconds per session (the debounce handles this).
- Full analyse: max 10 per user per hour — enforce server-side, return a `429` with a friendly message if exceeded.

---

## PHASE 5 — Community Files Visible on Public Profiles

5.1 Any canvas or solution a user submits to the Community is stored with `isPublic: true` and linked to their `userId`.

5.2 The public profile page (`/profile/[userId]`) fetches all community posts by that user and renders them in the "Community Posts" tab using the feed card component from 2.3.

5.3 The authenticated user's own profile also shows this tab, with an additional "Delete from Community" action.

5.4 Ensure no private/unsaved canvases leak into the public view — only explicitly community-submitted content is shown.

---

## PHASE 6 — Vercel Deployment & Database Migration

**6.1 Database:**
- Migrate to **Supabase** (PostgreSQL) or **MongoDB Atlas** (developer's preference — provide the connection string).
- All current local/dev DB calls must be replaced with the hosted client.
- Use Prisma (if Supabase/PG) or Mongoose (if MongoDB) — whichever matches the existing ORM.
- Add `DATABASE_URL` to `.env.local` and `.env.example`.

**6.2 Environment variables — create `.env.example` with all required keys:**
```
# Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Database
DATABASE_URL=

# Gemini
GEMINI_API_KEY=

# Redis (Upstash recommended for Vercel)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# App
NEXT_PUBLIC_APP_URL=
```

**6.3 API routes:**
- All API routes must be Next.js Route Handlers (`app/api/...`) — no separate Express/backend server.
- The SSE endpoint (Task 4) must use Next.js streaming response (`new Response(stream, { headers: { 'Content-Type': 'text/event-stream' } })`) — this is compatible with Vercel's streaming support.

**6.4 `vercel.json`:**
```json
{
  "functions": {
    "app/api/canvas/analyse/stream/route.ts": {
      "maxDuration": 60
    }
  }
}
```

**6.5 Deployment checklist:**
- All images use `next/image` with `remotePatterns` configured.
- No file-system reads/writes at runtime (use DB or object storage).
- Environment variables added to Vercel project dashboard (document this in `README.md`).
- `next build` must pass with zero errors before task is considered complete.

---

## PHASE 7 — Code Quality & Consistency Pass

After all features are implemented:

7.1 Run through the `design.md` §12 checklist on every page — check off each item.

7.2 Test light mode and dark mode on every page — every component must respond correctly to theme switching.

7.3 Verify all animations play correctly on first load and on route navigation.

7.4 Ensure the SSE stream works end-to-end: speculative cache → instant replay → full Gemini continuation → done event.

7.5 Check that the Excalidraw read-only embeds render correctly in Community feed, post detail, and Profile page without any editing UI leaking through.

7.6 Confirm Vercel build passes (`next build`). Fix any type errors or missing env guards.

---

## Constraints & Non-Negotiables

- **No AI-generated aesthetic** — nothing should look like a default shadcn/template output. Every component must have intentionality.
- **No inline styles** except for dynamic values (CSS custom property overrides). All static styles go in CSS modules, Tailwind config, or global stylesheet using design tokens.
- **No new colour values** introduced anywhere that are not in `design.md` §2.
- **No whitespace violations** — if a section feels empty, fill it with meaningful content or a visual, not more padding.
- **Copy is content** — every piece of UI text (labels, placeholders, empty states, error messages) must be written like a product designer wrote it, not a developer.
- **Do not break existing functionality** while redesigning. Redesign wraps around the existing logic — it does not replace it.
- The SSE + Redis speculative streaming (Task 4) is the most architecturally sensitive task. Plan it completely, implement incrementally, and test each SSE event type in isolation before integrating.