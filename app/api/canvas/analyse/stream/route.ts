import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  cleanGeneratedCode,
  deleteCanvasCache,
  getAnalysisSession,
  getCanvasCache,
  incrementRateLimit
} from "@/lib/canvas-analysis-cache";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI?.getGenerativeModel({ model: "gemini-2.5-flash" });

function buildPrompt(language: string, problemContext?: string) {
  return `You are a strictly literal code translator. Convert the exact Excalidraw flowchart image into ${language} code.
Rules:
1. Output raw code only. No markdown.
2. Do not add steps that are missing from the diagram.
3. Preserve flawed logic if the drawing is flawed.
4. If context is absent, infer the algorithm from the canvas.
Problem context: ${problemContext || "Not provided"}`;
}

function sse(event: string | null, data: string) {
  const payload = data.replace(/\n/g, "\\n");
  return event ? `event: ${event}\ndata: ${payload}\n\n` : `data: ${payload}\n\n`;
}

function longestOverlap(prefix: string, full: string) {
  const max = Math.min(prefix.length, full.length);
  for (let size = max; size > 0; size -= 1) {
    if (prefix.slice(-size) === full.slice(0, size)) return size;
  }
  return 0;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId") || "";
  if (!sessionId) return new Response("Missing sessionId", { status: 400 });

  const session = await getAnalysisSession(sessionId);
  if (!session) return new Response("No canvas analysis session found", { status: 404 });

  const { userId } = await auth();
  const bucket = userId || sessionId;
  const allowed = await incrementRateLimit(`full:${bucket}`, 10, 60 * 60);
  if (!allowed) {
    return new Response(sse("error", "Analysis limit reached. Try again later."), {
      status: 429,
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" }
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let sent = "";

      try {
        const cached = await getCanvasCache(`speculative:${sessionId}`);
        if (cached) {
          for (const token of cached.match(/.{1,12}/gs) ?? []) {
            sent += token;
            controller.enqueue(encoder.encode(sse(null, token)));
          }
        }
        controller.enqueue(encoder.encode(sse("cacheEnd", "refining")));

        if (!model) {
          const fallback = sent || `// No Gemini key found. Expected ${session.language} code from image.\n`;
          if (!sent) controller.enqueue(encoder.encode(sse(null, fallback)));
          controller.enqueue(encoder.encode(sse("done", "complete")));
          return;
        }

        const parts: any[] = [{ text: buildPrompt(session.language, session.problemContext) }];
        if (session.imageBase64) {
          parts.push({ inlineData: { data: session.imageBase64, mimeType: "image/png" } });
        }

        let full = "";
        const result = await model.generateContentStream(parts);
        for await (const chunk of result.stream) {
          full += cleanGeneratedCode(chunk.text());
        }

        const overlap = sent ? longestOverlap(sent, full) : 0;
        const delta = sent ? full.slice(overlap) : full;
        for (const token of delta.match(/.{1,12}/gs) ?? []) {
          controller.enqueue(encoder.encode(sse(null, token)));
        }

        controller.enqueue(encoder.encode(sse("done", "complete")));
      } catch (error) {
        console.error("Canvas stream error:", error);
        controller.enqueue(encoder.encode(sse(null, "\n// Error generating code from image.\n")));
        controller.enqueue(encoder.encode(sse("done", "complete")));
      } finally {
        await deleteCanvasCache(`speculative:${sessionId}`);
        await deleteCanvasCache(`session:${sessionId}`);
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" }
  });
}
