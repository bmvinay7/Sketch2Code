"use client";

interface AnalysisPanelProps {
  markdown?: string;
}

export function AnalysisPanel({ markdown }: AnalysisPanelProps) {
  if (!markdown) return null;

  const isCorrect = markdown.trim().toLowerCase() === "correct algorithm.";

  return (
    <section className="mt-6 border-t border-rule pt-5">
      <header className="flex items-center justify-between">
        <p className="eyebrow">analysis</p>
        <span
          className={`font-mono text-[10px] uppercase tracking-cap ${
            isCorrect ? "text-lime" : "text-amber"
          }`}
        >
          {isCorrect ? "● correct" : "● needs review"}
        </span>
      </header>
      <p className="mt-4 whitespace-pre-wrap font-sans text-[13px] leading-relaxed text-paper-100">
        {markdown}
      </p>
    </section>
  );
}
