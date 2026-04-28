import { Router } from "express";
import { Prisma, PrismaClient } from "@prisma/client";
import { analyzeAlgorithm } from "../services/gemini.js";
import { getSession } from "../services/redis.js";

export const analyzeRouter = Router();
const prisma = new PrismaClient();

analyzeRouter.post("/", async (request, response) => {
  const body = request.body as { sessionId: string; flowchartId?: string; imageBase64?: string; problemContext?: string };
  const analysis = await analyzeAlgorithm(body.imageBase64, body.problemContext);
  response.json({ analysis });
});
