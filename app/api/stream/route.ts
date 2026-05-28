import { buildStreamPrompt, streamShapeCode } from "@/lib/gemini";
import type { CodeLanguage } from "@/types/canvas";

// Node runtime: the Gemini SDK pulls in node-only deps.
export const runtime = "nodejs";
// Vercel hobby tier max for a single function execution.
export const maxDuration = 60;
// Force dynamic so this never gets cached or pre-rendered.
export const dynamic = "force-dynamic";

interface StreamBody {
  sessionId: string;
  imageBase64?: string;
  language: CodeLanguage;
  problemContext?: string;
}

export async function POST(request: Request) {
  let body: StreamBody;
  try {
    body = (await request.json()) as StreamBody;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body." }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const prompt = buildStreamPrompt(body.language, body.problemContext);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        await streamShapeCode(prompt, body.imageBase64, body.language, (text) => {
          const frame = `data: ${text.replace(/\n/g, "\\n")}\n\n`;
          controller.enqueue(encoder.encode(frame));
        });
        controller.enqueue(encoder.encode("event: done\ndata: complete\n\n"));
      } catch (error) {
        console.error("[api/stream]", error);
        controller.enqueue(encoder.encode("event: error\ndata: stream-failed\n\n"));
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Vercel-specific: opt out of edge buffering so chunks flush as written.
      "X-Accel-Buffering": "no"
    }
  });
}
