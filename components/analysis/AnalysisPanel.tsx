"use client";

import { CheckCircle2, AlertTriangle } from "lucide-react";

interface AnalysisPanelProps {
  markdown?: string;
}

export function AnalysisPanel({ markdown }: AnalysisPanelProps) {
  if (!markdown) return null;

  const isCorrect = markdown.trim().toLowerCase() === "correct algorithm.";

  return (
    <section className="mt-5">
      <article className={`rounded-lg border bg-surface p-4 ${isCorrect ? "border-success/50" : "border-warning/50"}`}>
        <div className="flex items-center gap-2">
          {isCorrect ? (
            <CheckCircle2 className="h-4 w-4 text-success" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-warning" />
          )}
          <h3 className={`text-sm font-bold ${isCorrect ? "text-success" : "text-warning"}`}>
            Algorithm Analysis
          </h3>
        </div>
        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-text-secondary">
          {markdown || "No notes returned yet."}
        </p>
      </article>
    </section>
  );
}
