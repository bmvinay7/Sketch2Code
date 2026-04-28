import type { FlowShape, ShapeType } from "@/types/canvas";

export const shapeMeta: Record<ShapeType, { label: string; fill: string; border: string }> = {
  start: { label: "Start/End", fill: "#10b981", border: "#34d399" },
  end: { label: "End", fill: "#10b981", border: "#34d399" },
  process: { label: "Process", fill: "#6366f1", border: "#818cf8" },
  io: { label: "Input/Output", fill: "#22d3ee", border: "#67e8f9" },
  decision: { label: "Decision", fill: "#f59e0b", border: "#fbbf24" },
  connector: { label: "Connector", fill: "#94a3b8", border: "#cbd5e1" }
};

export function defaultShape(type: ShapeType, x: number, y: number): FlowShape {
  const normalizedX = Math.max(0.05, Math.min(0.9, x));
  const normalizedY = Math.max(0.05, Math.min(0.9, y));
  return {
    id: crypto.randomUUID(),
    type,
    label: type === "start" ? "Start" : type === "end" ? "End" : "",
    x: normalizedX,
    y: normalizedY,
    width: type === "decision" ? 0.13 : 0.16,
    height: type === "decision" ? 0.13 : 0.09,
    connections: [],
    isComplete: type === "start" || type === "end"
  };
}

export function denormalize(shape: FlowShape, width: number, height: number) {
  return {
    x: shape.x * width,
    y: shape.y * height,
    width: shape.width * width,
    height: shape.height * height
  };
}
