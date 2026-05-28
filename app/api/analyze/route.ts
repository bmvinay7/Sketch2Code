import { NextResponse } from "next/server";
import { analyzeAlgorithm } from "@/lib/gemini";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

interface AnalyzeBody {
  sessionId: string;
  imageBase64?: string;
  problemContext?: string;
}

export async function POST(request: Request) {
  let body: AnalyzeBody;
  try {
    body = (await request.json()) as AnalyzeBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  const analysis = await analyzeAlgorithm(body.imageBase64, body.problemContext);
  return NextResponse.json({ analysis });
}
