import type { CanvasConnection, CanvasSceneSnapshot, FlowShape } from "@/types/canvas";

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function asString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function normalizeCanvasSnapshot(value: unknown): CanvasSceneSnapshot {
  const record = asRecord(value);
  const shapes = Array.isArray(record?.shapes) ? (record.shapes as FlowShape[]) : [];
  const connections = Array.isArray(record?.connections) ? (record.connections as CanvasConnection[]) : [];
  const sceneElements = Array.isArray(record?.sceneElements)
    ? (record.sceneElements as ReadonlyArray<Record<string, unknown>>)
    : [];
  const appState = asRecord(record?.appState) ?? {};
  const files = asRecord(record?.files) as Record<string, Record<string, unknown>> | null;

  return {
    sceneElements,
    appState,
    files: files ?? {},
    shapes,
    connections
  };
}

export function buildCanvasSnapshot(input: {
  sceneElements: ReadonlyArray<Record<string, unknown>>;
  appState: Record<string, unknown>;
  files: Record<string, Record<string, unknown>>;
  shapes: FlowShape[];
  connections: CanvasConnection[];
}): CanvasSceneSnapshot {
  return {
    sceneElements: input.sceneElements,
    appState: input.appState,
    files: input.files,
    shapes: input.shapes,
    connections: input.connections
  };
}

export function generateSmartTitle(problemContext: string | undefined, code: string, language: string) {
  const fromContext = asString(problemContext)
    .replace(/\s+/g, " ")
    .trim()
    .split(/[.!?\n]/)[0]
    .replace(/^(solve|write|draw|build)\s+/i, "");

  if (fromContext.length > 0) {
    const base = fromContext.length > 72 ? `${fromContext.slice(0, 69).trimEnd()}...` : fromContext;
    return titleCase(base);
  }

  const functionMatch = code.match(/(?:def|function|class|public\s+static\s+\w+)\s+([A-Za-z_][A-Za-z0-9_]*)/);
  if (functionMatch?.[1]) {
    return `${titleCase(functionMatch[1].replace(/[_-]+/g, " "))} Flowchart`;
  }

  return `${language.toUpperCase()} Flowchart Draft`;
}
