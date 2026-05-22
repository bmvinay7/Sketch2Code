import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";
import type { CodeLanguage } from "../types.js";

// Tried in order. If a request to the first one returns a transient overload
// status (503 / 429 / 500), we fall through to the next one. Older / smaller
// models are used as fallbacks because they tend to have more available
// capacity when the latest model is at peak demand.
const MODEL_FALLBACK_CHAIN = [
  "gemini-2.5-flash",
  "gemini-1.5-flash",
  "gemini-1.5-flash-8b",
  "gemini-1.5-pro"
];

const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const MAX_RETRIES_PER_MODEL = 3;
const INITIAL_BACKOFF_MS = 500;

let genAI: GoogleGenerativeAI | null = null;
const modelCache = new Map<string, GenerativeModel>();

function getClient(): GoogleGenerativeAI | null {
  if (genAI) return genAI;
  // Read the key lazily so dotenv.config() in env.ts has already run by the
  // time the first request arrives.
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  genAI = new GoogleGenerativeAI(apiKey);
  return genAI;
}

function getModel(name: string): GenerativeModel | null {
  const client = getClient();
  if (!client) return null;
  let model = modelCache.get(name);
  if (!model) {
    model = client.getGenerativeModel({ model: name });
    modelCache.set(name, model);
  }
  return model;
}

function isRetryableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const message = (error as { message?: string }).message ?? "";
  // Daily quota exhaustion is a 429 but won't recover for many hours, so don't
  // burn retries on the same model. The fallback chain will move on.
  if (/quota|free_tier|generate_content_free_tier/i.test(message)) return false;
  const status = (error as { status?: number }).status;
  if (typeof status === "number" && RETRYABLE_STATUSES.has(status)) return true;
  return /\b(503|502|500|429|overload|unavailable|high demand)\b/i.test(message);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runWithFallback<T>(
  operation: (model: GenerativeModel) => Promise<T>
): Promise<{ ok: true; value: T } | { ok: false; lastError: unknown }> {
  let lastError: unknown = null;
  for (const modelName of MODEL_FALLBACK_CHAIN) {
    const model = getModel(modelName);
    if (!model) continue;
    for (let attempt = 0; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
      try {
        const value = await operation(model);
        return { ok: true, value };
      } catch (error) {
        lastError = error;
        if (!isRetryableError(error) || attempt === MAX_RETRIES_PER_MODEL) {
          // Either non-retryable or we've exhausted retries on this model.
          // Move to the next model in the chain (outer loop continues).
          if (!isRetryableError(error)) break;
          break;
        }
        const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
        console.warn(`[gemini] ${modelName} attempt ${attempt + 1} failed, retrying in ${backoff}ms`);
        await sleep(backoff);
      }
    }
    if (lastError) {
      console.warn(`[gemini] falling back from ${modelName} after error:`, (lastError as Error)?.message ?? lastError);
    }
  }
  return { ok: false, lastError };
}

function buildParts(prompt: string, imageBase64: string | undefined) {
  const parts: any[] = [{ text: prompt }];
  if (imageBase64) {
    parts.push({
      inlineData: {
        data: imageBase64,
        mimeType: "image/png"
      }
    });
  }
  return parts;
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

function commentForLanguage(language: CodeLanguage, message: string) {
  const prefix = language === "python" ? "# " : "// ";
  return message
    .split("\n")
    .map((line) => prefix + line)
    .join("\n") + "\n";
}

export async function streamShapeCode(
  prompt: string,
  imageBase64: string | undefined,
  language: CodeLanguage,
  onChunk: (text: string) => void
) {
  if (!getClient()) {
    onChunk(commentForLanguage(language, `No Gemini key found.\nExpected ${language} code from image.`));
    return;
  }

  const parts = buildParts(prompt, imageBase64);

  // Track whether the current attempt has emitted any bytes. If a model errors
  // *mid-stream* we cannot safely fall back to another model, otherwise the
  // client would see two interleaved snippets concatenated together.
  let lastError: unknown = null;
  let emittedAny = false;

  for (const modelName of MODEL_FALLBACK_CHAIN) {
    const model = getModel(modelName);
    if (!model) continue;

    let succeeded = false;
    for (let attempt = 0; attempt <= MAX_RETRIES_PER_MODEL; attempt++) {
      emittedAny = false;
      try {
        const stream = await model.generateContentStream(parts);
        for await (const chunk of stream.stream) {
          const text = chunk.text();
          if (text) {
            emittedAny = true;
            // Strip markdown fences in case the model ignores instructions.
            onChunk(text.replace(/```(?:python|java|cpp)?\n/gi, "").replace(/```/g, ""));
          }
        }
        succeeded = true;
        break;
      } catch (error) {
        lastError = error;
        if (emittedAny) {
          // Partial output already sent; do not retry or fall back.
          console.error(`[gemini] ${modelName} errored mid-stream after partial output:`, (error as Error)?.message ?? error);
          onChunk(commentForLanguage(language, "\nStream interrupted by Gemini. Output above may be incomplete."));
          return;
        }
        if (!isRetryableError(error) || attempt === MAX_RETRIES_PER_MODEL) {
          break;
        }
        const backoff = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
        console.warn(`[gemini] ${modelName} stream attempt ${attempt + 1} failed (${(error as Error)?.message ?? error}), retrying in ${backoff}ms`);
        await sleep(backoff);
      }
    }

    if (succeeded) return;
    console.warn(`[gemini] falling back from ${modelName} after error:`, (lastError as Error)?.message ?? lastError);
  }

  const error = lastError as { status?: number; message?: string } | null;
  console.error("[gemini] stream failed across all models:", error?.message ?? error);
  const message = error?.message ?? "";
  if (/quota|free_tier|generate_content_free_tier/i.test(message)) {
    onChunk(commentForLanguage(language, "Gemini daily quota exceeded across all fallback models. Wait until quota resets or upgrade your API plan."));
  } else if (error?.status === 503 || /overload|unavailable|high demand/i.test(message)) {
    onChunk(commentForLanguage(language, "Gemini is overloaded right now. Please retry in a few seconds."));
  } else if (error?.status === 429) {
    onChunk(commentForLanguage(language, "Rate limit reached. Please wait a moment and try again."));
  } else {
    onChunk(commentForLanguage(language, `Error generating code from image: ${error?.message ?? "unknown error"}`));
  }
}

export async function analyzeAlgorithm(imageBase64: string | undefined, problemContext?: string): Promise<string> {
  if (!getClient()) return "No Gemini key configured.";

  const prompt = `You are a DSA teaching assistant.
Analyze this flowchart.
If the algorithm is correct, reply exactly with: "Correct algorithm." and nothing else.
If there are errors, describe the specific error concisely in 2 to 3 lines maximum.
Do not bluff or be vague. Focus on the exact logic flaw.
Problem context: ${problemContext ?? "None"}`;

  const parts = buildParts(prompt, imageBase64);

  const result = await runWithFallback(async (model) => {
    const response = await model.generateContent(parts);
    return response.response.text();
  });

  if (!result.ok) {
    const error = result.lastError as { status?: number; message?: string } | null;
    console.error("[gemini] analyze failed across all models:", error?.message ?? error);
    const message = error?.message ?? "";
    if (/quota|free_tier|generate_content_free_tier/i.test(message)) {
      return "Gemini daily quota exceeded across all fallback models. Wait until quota resets or upgrade your API plan.";
    }
    if (error?.status === 503 || /overload|unavailable|high demand/i.test(message)) {
      return "Gemini is overloaded right now. Please retry in a few seconds.";
    }
    if (error?.status === 429) {
      return "Rate limit reached. Please wait a moment and try again.";
    }
    return `Error analyzing algorithm: ${error?.message ?? "unknown error"}`;
  }

  return result.value;
}
