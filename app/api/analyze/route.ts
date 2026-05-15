import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createAiCacheKey, getCachedAiResult, setCachedAiResult } from "@/lib/ai-cache";

export const maxDuration = 60; // Allow Vercel functions to run for up to 60s

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI?.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(req: Request) {
  const { imageBase64, problemContext } = await req.json();
  const cacheKey = createAiCacheKey(["analyze", problemContext, imageBase64]);
  const cached = await getCachedAiResult(cacheKey);

  if (cached) {
    return NextResponse.json({ analysis: cached });
  }

  if (!model) {
    return NextResponse.json({ error: "No Gemini key configured." }, { status: 500 });
  }

  const prompt = `You are a DSA teaching assistant.
Analyze this flowchart.
If the algorithm is correct, reply exactly with: "Correct algorithm." and nothing else.
If there are errors, describe the specific error concisely in 2 to 3 lines maximum.
Do not bluff or be vague. Focus on the exact logic flaw.
Problem context: ${problemContext ?? "None"}`;

  const parts: any[] = [{ text: prompt }];
  if (imageBase64) {
    parts.push({
      inlineData: {
        data: imageBase64,
        mimeType: "image/png"
      }
    });
  }

  try {
    const result = await model.generateContent(parts);
    const analysis = result.response.text();
    if (analysis.trim()) {
      await setCachedAiResult(cacheKey, analysis, 60 * 30);
    }
    return NextResponse.json({ analysis });
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return NextResponse.json({ error: "Error analyzing algorithm." }, { status: 500 });
  }
}
