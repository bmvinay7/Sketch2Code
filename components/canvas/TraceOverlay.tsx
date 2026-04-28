"use client";

import type { TraceStep } from "@/types/canvas";

export function TraceOverlay({ step }: { step?: TraceStep }) {
  if (!step) return null;
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 rounded-lg border border-error/50 bg-surface/90 px-4 py-3 text-sm shadow-indigo">
      <p className="font-bold text-error">Line {step.lineNumber}</p>
      <pre className="mt-1 font-mono text-xs text-text-secondary">{JSON.stringify(step.variables, null, 2)}</pre>
    </div>
  );
}
