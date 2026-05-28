// IMPORTANT: load env variables before any other imports so that services
// reading process.env at module-load time still see the values.
import "./env.js";

import cors from "cors";
import express from "express";
import { analyzeRouter } from "./routes/analyze.js";
import { streamRouter } from "./routes/stream.js";
import { traceRouter } from "./routes/trace.js";

const app = express();
const port = Number(process.env.PORT ?? 4001);

// ALLOWED_ORIGINS is a comma-separated env var so prod deploys can add the
// Vercel domain without touching code. Defaults to local dev only.
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? "http://localhost:4000")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, service: "sketch2code-backend" });
});

app.use("/stream", streamRouter);
app.use("/analyze", analyzeRouter);
app.use("/trace", traceRouter);

app.listen(port, () => {
  console.log(`Sketch2Code backend listening on ${port}`);
});
