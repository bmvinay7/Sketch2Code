import { GoogleGenerativeAI } from "@google/generative-ai";
import { createAiCacheKey, getCachedAiResult, setCachedAiResult } from "@/lib/ai-cache";

export const maxDuration = 60; // Allow Vercel functions to run for up to 60s
export const dynamic = "force-dynamic";

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI?.getGenerativeModel({ model: "gemini-2.5-flash" });

function buildStreamPrompt(language: string, problemContext?: string) {
  return `You are a strictly literal code translator. Your ONLY job is to convert the EXACT steps shown in the flowchart image into ${language} code.
CRITICAL RULES:
1. Do NOT fix bugs. Do NOT add missing steps. Do NOT assume intentions.
2. If the flowchart is missing an output/print step, your code MUST NOT contain any print or output statements.
3. If the logic is fundamentally flawed or incomplete, write the code exactly as flawed or incomplete as the drawing.
4. Generate ONLY the raw code. No markdown wrappers, no explanations, no greetings.
Problem context: ${problemContext ?? "Not provided"}`;
}

export async function POST(req: Request) {
  const { sessionId, imageBase64, language, problemContext } = await req.json();
  const cacheKey = createAiCacheKey(["stream", sessionId, language, problemContext, imageBase64]);
  const cached = await getCachedAiResult(cacheKey);

  if (cached) {
    return new Response(`data: ${cached.replace(/\n/g, "\\n")}\n\nevent: done\ndata: complete\n\n`, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" }
    });
  }

  if (!model) {
    return new Response(`data: // No Gemini key found.\ndata: // Expected ${language} code from image.\nevent: done\ndata: complete\n\n`, {
      headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" }
    });
  }

  const prompt = buildStreamPrompt(language, problemContext);
  const parts: any[] = [{ text: prompt }];
  if (imageBase64) {
    parts.push({
      inlineData: {
        data: imageBase64,
        mimeType: "image/png"
      }
    });
  }

  const encoder = new TextEncoder();
  const customReadable = new ReadableStream({
    async start(controller) {
      let fullText = "";
      try {
        const result = await model.generateContentStream(parts);
        for await (const chunk of result.stream) {
          const text = chunk.text();
          const cleanText = text.replace(/```(?:python|java|cpp|javascript|typescript|go|rust|ruby|php)?\n/gi, "").replace(/```/g, "");
          fullText += cleanText;
          controller.enqueue(encoder.encode(`data: ${cleanText.replace(/\n/g, "\\n")}\n\n`));
        }
        if (fullText.trim()) {
          await setCachedAiResult(cacheKey, fullText, 60 * 20);
        }
      } catch (error) {
        console.error("Gemini stream error:", error);
        controller.enqueue(encoder.encode(`data: \\n// Error generating code from image.\n\n`));
      } finally {
        controller.enqueue(encoder.encode("event: done\ndata: complete\n\n"));
        controller.close();
      }
    }
  });

  return new Response(customReadable, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" }
  });
}
