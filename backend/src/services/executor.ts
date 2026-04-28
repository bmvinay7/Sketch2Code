import type { CodeLanguage, FlowShape, TraceStep } from "../types.js";

export async function traceCode(code: string, language: CodeLanguage, shapes: FlowShape[]): Promise<TraceStep[]> {
  if (language !== "python") {
    return shapes.map((shape, index) => ({
      shapeId: shape.id,
      lineNumber: index + 1,
      variables: { note: "Trace playback is currently implemented for Python." }
    }));
  }

  const lines = code.split("\n").filter(Boolean);
  return lines.slice(0, Math.max(lines.length, shapes.length)).map((line, index) => {
    const shape = shapes[Math.min(index, Math.max(0, shapes.length - 1))];
    return {
      shapeId: shape?.id ?? "unknown",
      lineNumber: index + 1,
      variables: { line: line.trim() }
    };
  });
}
