import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { analyzeRouter } from "./routes/analyze.js";
import { streamRouter } from "./routes/stream.js";
import { traceRouter } from "./routes/trace.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4001);

app.use(cors({ origin: ["http://localhost:4000", "https://sketchcode.lovable.app"] }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_request, response) => {
  response.json({ ok: true, service: "sketch2code-backend" });
});

app.use("/stream", streamRouter);
app.use("/analyze", analyzeRouter);
app.use("/trace", traceRouter);

app.listen(port, () => {
  console.log(`Sketch2Code backend listening on ${port}`);
});
