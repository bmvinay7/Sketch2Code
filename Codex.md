# CLAUDE.md — Sketch2Code

This file tells Claude Code everything it needs to know to work on this codebase.

---

## Project Overview

Sketch2Code is a DSA learning platform where students draw flowcharts on an HTML canvas and receive real-time streaming code generation. Wrong algorithms generate wrong code intentionally — an analysis engine then teaches what went wrong.

**The core loop:** Draw shape → code streams in → finish diagram → run analysis + trace mode → publish to community.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Canvas | Konva.js (React-Konva for shape management) |
| Backend | Node.js, Express (separate service on port 3001) |
| AI | Google Gemini 2.5 Flash (`gemini-2.5-flash`) |
| Database | Neon (PostgreSQL) via Prisma ORM |
| Cache | Redis via Upstash (`@upstash/redis`) |
| Auth | Clerk (`@clerk/nextjs`) |
| Streaming | SSE (Server-Sent Events) for code generation |
| Deployment | Vercel (frontend) + Railway (backend) |

---

## Repository Structure

```
sketch2code/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Clerk auth pages
│   ├── (marketing)/            # Landing, about
│   │   └── page.tsx            # Homepage
│   ├── canvas/                 # Main drawing experience
│   │   └── [id]/page.tsx
│   ├── community/              # Algorithm library
│   │   ├── page.tsx            # Browse
│   │   └── [postId]/page.tsx   # Individual post
│   ├── profile/                # User profile + history
│   └── api/                    # Next.js API routes (auth webhooks, community CRUD)
│
├── backend/                    # Separate Node.js service
│   ├── src/
│   │   ├── routes/
│   │   │   ├── stream.ts       # SSE shape-to-code endpoint
│   │   │   ├── analyze.ts      # Full flowchart analysis
│   │   │   └── trace.ts        # Step-by-step execution log
│   │   ├── services/
│   │   │   ├── gemini.ts       # All Gemini API calls
│   │   │   ├── redis.ts        # Session context cache
│   │   │   └── executor.ts     # Safe code execution for trace
│   │   └── index.ts
│   └── package.json
│
├── components/
│   ├── canvas/
│   │   ├── FlowCanvas.tsx      # Main canvas component (Konva)
│   │   ├── ShapeToolbar.tsx    # Shape selection sidebar
│   │   ├── shapes/             # Individual shape components
│   │   └── TraceOverlay.tsx    # Trace mode highlight layer
│   ├── code/
│   │   ├── CodePanel.tsx       # Streaming code display
│   │   ├── GhostBlock.tsx      # Pending/unclosed code blocks
│   │   └── LanguageSelector.tsx
│   ├── analysis/
│   │   └── AnalysisPanel.tsx   # Error analysis + hints
│   └── community/
│       ├── FlowchartCard.tsx
│       └── LibraryFilters.tsx
│
├── lib/
│   ├── gemini.ts               # Gemini client init
│   ├── prisma.ts               # Prisma client singleton
│   ├── redis.ts                # Redis client (Upstash)
│   └── shapes.ts               # Shape type definitions + serialization
│
├── prisma/
│   └── schema.prisma
│
└── types/
    └── canvas.ts               # FlowShape, CanvasState, TraceStep types
```

---

## Environment Variables

```bash
# .env.local (frontend)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
DATABASE_URL=                    # Neon connection string
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# .env (backend)
GEMINI_API_KEY=
DATABASE_URL=                    # Same Neon connection string
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
PORT=3001
```

---

## Core Data Types

```typescript
// types/canvas.ts

type ShapeType = 'start' | 'end' | 'process' | 'io' | 'decision' | 'connector'

interface FlowShape {
  id: string
  type: ShapeType
  label: string
  x: number
  y: number
  width: number
  height: number
  connections: string[]     // IDs of shapes this connects to
  isComplete: boolean       // has label been finalized
}

interface CanvasState {
  sessionId: string
  shapes: FlowShape[]
  language: 'python' | 'java' | 'cpp'
  problemContext?: string   // what the student is trying to solve
  generatedCode: string     // accumulated code so far
  pendingShapeIds: string[] // shapes drawn but not yet "closed" in code
}

interface TraceStep {
  shapeId: string
  lineNumber: number
  variables: Record<string, unknown>
  output?: string
  branchTaken?: 'true' | 'false'
}
```

---

## Streaming Architecture (Critical — Read This)

The streaming code generation is the core feature. Here's exactly how it works:

### When a shape is completed on canvas:
1. Canvas fires `onShapeComplete(shape: FlowShape)`
2. Frontend sends a POST to `backend/stream` with:
   ```json
   {
     "sessionId": "abc123",
     "newShape": { ...FlowShape },
     "language": "python"
   }
   ```
3. Backend fetches `CanvasState` from Redis using `sessionId`
4. Backend calls Gemini with the accumulated context + new shape
5. Response streams back via SSE
6. Frontend appends streamed tokens to the code panel
7. If the shape is a diamond (decision) with no closing End node yet, the generated code block stays in "ghost" state

### Gemini Prompt Structure for Streaming:

```typescript
const systemPrompt = `
You are a code generator that translates flowchart shapes into ${language} code.
You receive shapes one at a time. Generate ONLY the code fragment for the new shape.
Do NOT add closing brackets, return statements, or function signatures unless the shape is an End node.
If the shape is an End node, close all open blocks and finalize the function.
Preserve the user's exact logic even if it is algorithmically incorrect.
Output ONLY raw code, no markdown, no explanation.
Current code so far:
${currentCode}
`

const userPrompt = `New shape: ${shape.type}, label: "${shape.label}". Continue the code.`
```

### Ghost State Rules:
- Diamond (decision) opens a branch → all subsequent code is ghost until the branch closes
- End node finalizes everything → all ghost code becomes solid
- Unclosed loops stay ghost (pending closing condition)
- Show ghost code dimmed (opacity 0.5) in the code panel with a pulsing border

---

## Gemini Service

```typescript
// backend/src/services/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

// For streaming generation
export async function streamShapeCode(prompt: string, onChunk: (text: string) => void) {
  const result = await model.generateContentStream(prompt)
  for await (const chunk of result.stream) {
    onChunk(chunk.text())
  }
}

// For full analysis (non-streaming)
export async function analyzeAlgorithm(canvasState: CanvasState): Promise<string> {
  const result = await model.generateContent(buildAnalysisPrompt(canvasState))
  return result.response.text()
}
```

---

## Redis Session Management

```typescript
// lib/redis.ts — session context cache
const SESSION_TTL = 60 * 60 * 2  // 2 hours

export async function getSession(sessionId: string): Promise<CanvasState | null> {
  const data = await redis.get(`session:${sessionId}`)
  return data ? JSON.parse(data as string) : null
}

export async function setSession(sessionId: string, state: CanvasState) {
  await redis.setex(`session:${sessionId}`, SESSION_TTL, JSON.stringify(state))
}
```

Key prefixes:
- `session:{id}` — active canvas state
- `rate:{userId}` — API call rate limiting (max 60 shapes/hour per user)

---

## Prisma Schema

```prisma
model User {
  id          String      @id @default(cuid())
  clerkId     String      @unique
  name        String
  email       String      @unique
  avatar      String?
  flowcharts  Flowchart[]
  saves       Save[]
  createdAt   DateTime    @default(now())
}

model Flowchart {
  id            String          @id @default(cuid())
  userId        String
  user          User            @relation(fields: [userId], references: [id])
  title         String
  problem       String?
  language      String          @default("python")
  shapes        Json
  generatedCode String          @db.Text
  isPublished   Boolean         @default(false)
  communityPost CommunityPost?
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
}

model CommunityPost {
  id          String    @id @default(cuid())
  flowchartId String    @unique
  flowchart   Flowchart @relation(fields: [flowchartId], references: [id])
  userId      String
  upvotes     Int       @default(0)
  views       Int       @default(0)
  tags        String[]
  isVerified  Boolean   @default(false)
  saves       Save[]
  createdAt   DateTime  @default(now())
}

model Save {
  id        String        @id @default(cuid())
  userId    String
  user      User          @relation(fields: [userId], references: [id])
  postId    String
  post      CommunityPost @relation(fields: [postId], references: [id])
  savedAt   DateTime      @default(now())
  @@unique([userId, postId])
}
```

---

## Design System

**Color Palette:**
```
Background:     #0a0a0f  (near black)
Surface:        #12121a  (card backgrounds)
Surface raised: #1a1a2e  (elevated elements)
Border:         #2a2a3e  (subtle borders)
Primary:        #6366f1  (indigo — brand color)
Primary glow:   #6366f120 (for hover states)
Accent:         #22d3ee  (cyan — used for trace highlights)
Success:        #10b981  (green — verified/correct)
Warning:        #f59e0b  (amber — analysis warnings)
Error:          #ef4444  (red — wrong branch in trace)
Text primary:   #f1f5f9
Text secondary: #94a3b8
Text muted:     #475569
```

**Canvas Shape Colors:**
```
Start/End:    #10b981 fill, #34d399 border
Process:      #6366f1 fill, #818cf8 border
IO:           #22d3ee fill, #67e8f9 border
Decision:     #f59e0b fill, #fbbf24 border
Active/trace: #ef4444 animated pulse ring
Ghost/pending: opacity 0.45, dashed border
```

**Font:** Inter (UI), JetBrains Mono (code panel)

**Animations:**
- Shape completion: spring scale 0.95 → 1.0
- Code stream: tokens fade in left to right
- Ghost to solid: opacity transition 400ms ease
- Trace highlight: 600ms pulse ring on shape

---

## Canvas Implementation Notes

- Use **Konva.js** via `react-konva` for the canvas. Do NOT use plain HTML5 canvas API.
- Shapes are drawn by clicking to place, not drag. Click once to place, click again to finish sizing.
- Arrows are drawn by hovering a shape until connection points appear (small circles at edges), then dragging from point to point.
- Every shape has an editable text label — double-click to edit, Enter to confirm.
- `onShapeComplete` fires when: label is confirmed AND at least one connection arrow exists OR shape is Start/End.
- Store all shape positions in normalized coordinates (0–1 range) so the canvas scales cleanly.

---

## Analysis Engine Prompt Guidelines

```typescript
const analysisSystemPrompt = `
You are a DSA teaching assistant. A student drew a flowchart to solve a problem and generated code from it.
Your job is NOT to fix their code. Your job is to:
1. State clearly what their algorithm actually does (describe the logic as-is)
2. Identify the specific step(s) in the flowchart where the logic diverges from the correct approach
3. Give 2-3 Socratic hints — questions that lead them to the right answer, not the answer itself
4. Never rewrite their algorithm or generate corrected code

Tone: Encouraging, precise, like a good TA. Not condescending.
Format: Use markdown. Sections: "What your algorithm does", "Where it goes wrong", "Hints to fix it"
`
```

---

## Commands

```bash
# Install all deps
npm install                   # root (Next.js)
cd backend && npm install     # backend service

# Dev
npm run dev                   # Next.js on :3000
cd backend && npm run dev     # Express on :3001

# Database
npx prisma generate
npx prisma migrate dev --name init
npx prisma studio             # GUI to inspect DB

# Type checking
npm run type-check

# Build
npm run build
cd backend && npm run build
```

---

## Things Claude Should Never Do in This Codebase

- **Never correct the generated code.** The faithfulness to user logic is the entire point.
- **Never use WebSockets** for code streaming — SSE is the decision, keep it.
- **Never store API keys in frontend code** — all Gemini calls go through the backend service.
- **Never execute user-generated code without sandboxing** — Trace Mode runs in a VM2/isolated-vm sandbox.
- **Never use `any` in TypeScript** — use the types in `types/canvas.ts`.
- **Never make the analysis engine give the answer directly** — hints only.