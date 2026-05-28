import { auth } from "@clerk/nextjs/server";
import { buildStreamPrompt, streamShapeCode } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rateLimit";
import type { CodeLanguage } from "@/types/canvas";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

interface StreamBody {
  sessionId: string;
  imageBase64?: string;
  language: CodeLanguage;
  problemContext?: string;
}

export async function POST(request: Request) {
  // Auth: stream is gated to signed-in users so anonymous traffic can't drain Gemini quota.
  const { userId } = await auth();
  if (!userId) {
    return jsonError("Sign in to generate code from your sketch.", 401);
  }

  const rate = checkRateLimit(`stream:${userId}`);
  if (!rate.allowed) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Try again in an hour." }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000))),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rate.resetAt)
        }
      }
    );
  }

  let body: StreamBody;
  try {
    body = (await request.json()) as StreamBody;
  } catch {
    return jsonError("Invalid JSON body.", 400);
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
      "X-Accel-Buffering": "no",
      "X-RateLimit-Remaining": String(rate.remaining),
      "X-RateLimit-Reset": String(rate.resetAt)
    }
  });
}

function jsonError(error: string, status: number) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
