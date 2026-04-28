import { Router } from "express";
import { buildStreamPrompt, streamShapeCode } from "../services/gemini.js";
import { checkRateLimit, getSession, setSession } from "../services/redis.js";
import type { CanvasConnection, CanvasState, CodeLanguage, FlowShape } from "../types.js";

interface StreamBody {
  sessionId: string;
  imageBase64?: string;
  language: CodeLanguage;
  problemContext?: string;
}

export const streamRouter = Router();

streamRouter.post("/", async (request, response) => {
  const body = request.body as StreamBody;
  const userKey = request.header("x-user-id") ?? body.sessionId;
  const allowed = await checkRateLimit(userKey);
  if (!allowed) {
    response.status(429).json({ error: "Rate limit exceeded. Try again later." });
    return;
  }

  response.setHeader("Content-Type", "text/event-stream");
  response.setHeader("Cache-Control", "no-cache, no-transform");
  response.setHeader("Connection", "keep-alive");
  response.flushHeaders();

  const prompt = buildStreamPrompt(body.language, body.problemContext);

  await streamShapeCode(prompt, body.imageBase64, body.language, (text) => {
    response.write(`data: ${text.replace(/\n/g, "\\n")}\n\n`);
  });

  response.write("event: done\ndata: complete\n\n");
  response.end();
});
