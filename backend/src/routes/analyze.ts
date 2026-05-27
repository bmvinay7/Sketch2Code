import { Router } from "express";
import { analyzeAlgorithm } from "../services/gemini.js";

export const analyzeRouter = Router();

analyzeRouter.post("/", async (request, response) => {
  const body = request.body as { sessionId: string; imageBase64?: string; problemContext?: string };
  const analysis = await analyzeAlgorithm(body.imageBase64, body.problemContext);
  response.json({ analysis });
});
