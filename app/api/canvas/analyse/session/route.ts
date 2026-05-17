import { NextResponse } from "next/server";
import { setAnalysisSession } from "@/lib/canvas-analysis-cache";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.sessionId) {
    return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
  }

  await setAnalysisSession({
    sessionId: body.sessionId,
    language: body.language ?? "python",
    problemContext: body.problemContext,
    imageBase64: body.imageBase64,
    snapshot: body.snapshot
  });

  return NextResponse.json({ ok: true });
}
