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

const IGNORE_TEXT = new Set(["start", "end", "yes", "no", "true", "false"]);

export function inferProblemContext(snapshot: CanvasSceneSnapshot | undefined) {
  if (!snapshot) return "";

  const candidateLines = snapshot.sceneElements
    .map((element) => asRecord(element))
    .filter((element) => element?.type === "text" && typeof element.text === "string")
    .map((element) => asString(element?.text).trim())
    .flatMap((text) => text.split("\n"))
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line) => line.length > 2 && !IGNORE_TEXT.has(line.toLowerCase()))
    .filter((line, index, lines) => lines.findIndex((entry) => entry.toLowerCase() === line.toLowerCase()) === index);

  if (candidateLines.length === 0) return "";

  const lead = candidateLines.slice(0, 4).join(", ");
  if (lead.length <= 96) return `Flowchart discussing ${lead}`;

  return `Flowchart discussing ${lead.slice(0, 93).trimEnd()}...`;
}
