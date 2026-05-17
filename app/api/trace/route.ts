import { NextResponse } from "next/server";
import type { CodeLanguage, FlowShape, TraceStep } from "@/types/canvas";

export const maxDuration = 30;

/**
 * Lightweight trace endpoint — maps generated code lines back to
 * the canvas shapes that produced them. This runs entirely in the
 * Next.js runtime (no sandboxed execution), so it's safe for Vercel
 * serverless functions.
 */
export async function POST(request: Request) {
  const body = (await request.json()) as {
    code: string;
    language: CodeLanguage;
    sampleInput?: string;
    shapes: FlowShape[];
  };

  const { code, language, shapes } = body;

  if (language !== "python") {
    const steps: TraceStep[] = shapes.map((shape, index) => ({
      shapeId: shape.id,
      lineNumber: index + 1,
      variables: { note: "Trace playback is currently implemented for Python." }
    }));
    return NextResponse.json({ steps });
  }

  const lines = code.split("\n").filter(Boolean);
  const steps: TraceStep[] = lines
    .slice(0, Math.max(lines.length, shapes.length))
    .map((line, index) => {
      const shape = shapes[Math.min(index, Math.max(0, shapes.length - 1))];
      return {
        shapeId: shape?.id ?? "unknown",
        lineNumber: index + 1,
        variables: { line: line.trim() }
      };
    });

  return NextResponse.json({ steps });
}
