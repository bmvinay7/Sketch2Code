import { Router } from "express";
import { traceCode } from "../services/executor.js";
import type { CodeLanguage, FlowShape } from "../types.js";

export const traceRouter = Router();

traceRouter.post("/", async (request, response) => {
  const body = request.body as {
    code: string;
    language: CodeLanguage;
    sampleInput?: string;
    shapes: FlowShape[];
  };
  const steps = await traceCode(body.code, body.language, body.shapes);
  response.json({ steps });
});
