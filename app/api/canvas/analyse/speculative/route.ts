import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { incrementRateLimit, setCanvasCache, summarizeCanvasSnapshot, cleanGeneratedCode } from "@/lib/canvas-analysis-cache";

export const dynamic = "force-dynamic";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI?.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(request: Request) {
  const body = await request.json();
  const sessionId = String(body.sessionId || "");
  if (!sessionId) return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });

  const allowed = await incrementRateLimit(`speculative:${sessionId}`, 1, 2);
  if (!allowed) return NextResponse.json({ skipped: true }, { status: 202 });

  if (!model) {
    await setCanvasCache(`speculative:${sessionId}`, `// Sketch the diagram, then run analysis for ${body.language ?? "python"}.\n`, 60 * 5);
    return NextResponse.json({ cached: true });
  }

  const summary = summarizeCanvasSnapshot(body.snapshot);
  const prompt = `Based on this partial DSA Excalidraw diagram, begin generating ${body.language ?? "python"} code for the algorithm it likely represents. Output only code you can confidently infer. Problem context: ${body.problemContext || "Not provided"}\nCanvas summary:\n${JSON.stringify(summary)}`;

  try {
    const result = await model.generateContent(prompt);
    const code = cleanGeneratedCode(result.response.text());
    if (code.trim()) await setCanvasCache(`speculative:${sessionId}`, code, 60 * 5);
    return NextResponse.json({ cached: true });
  } catch (error) {
    console.error("Speculative Gemini error:", error);
    return NextResponse.json({ cached: false }, { status: 202 });
  }
}
