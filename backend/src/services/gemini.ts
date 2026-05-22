import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";
import type { CodeLanguage } from "../types.js";

let genAI: GoogleGenerativeAI | null = null;
let cachedModel: GenerativeModel | null = null;

function getModel(): GenerativeModel | null {
  if (cachedModel) return cachedModel;

  // Read the key lazily so dotenv.config() in index.ts has already run by the
  // time the first request comes in. Reading it at module-import time would
  // capture an undefined value and permanently disable the client.
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  genAI = new GoogleGenerativeAI(apiKey);
  cachedModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  return cachedModel;
}

export function buildStreamPrompt(language: CodeLanguage, problemContext?: string) {
  return `You are a strictly literal code translator. Your ONLY job is to convert the EXACT steps shown in the flowchart image into ${language} code.
CRITICAL RULES:
1. Do NOT fix bugs. Do NOT add missing steps. Do NOT assume intentions.
2. If the flowchart is missing an output/print step, your code MUST NOT contain any print or output statements.
3. If the logic is fundamentally flawed or incomplete, write the code exactly as flawed or incomplete as the drawing.
4. Generate ONLY the raw code. No markdown wrappers, no explanations, no greetings.
Problem context: ${problemContext ?? "Not provided"}`;
}

export async function streamShapeCode(prompt: string, imageBase64: string | undefined, language: CodeLanguage, onChunk: (text: string) => void) {
  const model = getModel();
  if (!model) {
    onChunk(`// No Gemini key found.\n// Expected ${language} code from image.\n`);
    return;
  }

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
    const result = await model.generateContentStream(parts);
    for await (const chunk of result.stream) {
      const text = chunk.text();
      // Clean up markdown wrappers if the model ignores instructions
      onChunk(text.replace(/```(?:python|java|cpp)?\n/gi, "").replace(/```/g, ""));
    }
  } catch (error) {
    console.error("Gemini stream error:", error);
    onChunk("\n// Error generating code from image.");
  }
}

export async function analyzeAlgorithm(imageBase64: string | undefined, problemContext?: string): Promise<string> {
  const model = getModel();
  if (!model) return "No Gemini key configured.";

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
    return result.response.text();
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return "Error analyzing algorithm.";
  }
}
