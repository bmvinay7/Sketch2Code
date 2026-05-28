import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { analyzeAlgorithm } from "@/lib/gemini";
import { checkRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

interface AnalyzeBody {
  sessionId: string;
  imageBase64?: string;
  problemContext?: string;
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Sign in to analyze your sketch." }, { status: 401 });
  }

  const rate = checkRateLimit(`analyze:${userId}`);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again in an hour." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000)))
        }
      }
    );
  }

  let body: AnalyzeBody;
  try {
    body = (await request.json()) as AnalyzeBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const analysis = await analyzeAlgorithm(body.imageBase64, body.problemContext);
  return NextResponse.json({ analysis });
}
