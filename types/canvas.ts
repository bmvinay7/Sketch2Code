export type ShapeType = "start" | "end" | "process" | "io" | "decision" | "connector";
export type CodeLanguage = "python" | "java" | "cpp";

export interface FlowShape {
  id: string;
  type: ShapeType;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  connections: string[];
  isComplete: boolean;
}

export interface CanvasConnection {
  id: string;
  from: string;
  to: string;
}

export interface CanvasState {
  sessionId: string;
  shapes: FlowShape[];
  connections: CanvasConnection[];
  language: CodeLanguage;
  problemContext?: string;
  generatedCode: string;
  pendingShapeIds: string[];
}

export interface TraceStep {
  shapeId: string;
  lineNumber: number;
  variables: Record<string, unknown>;
  output?: string;
  branchTaken?: "true" | "false";
}

export interface AnalysisSections {
  does: string;
  wrong: string;
  hints: string;
}
