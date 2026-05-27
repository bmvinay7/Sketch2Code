"use client";

import { Copy } from "lucide-react";
import type { CodeLanguage } from "@/types/canvas";
import { AnalysisPanel } from "@/components/analysis/AnalysisPanel";

interface CodePanelProps {
  code: string;
  language: CodeLanguage;
  isStreaming: boolean;
  hasGhost: boolean;
  analysis?: string;
  onCopy: () => void;
}

const EXT: Record<CodeLanguage, string> = {
  python: "py",
  java: "java",
  cpp: "cpp"
};

export function CodePanel({ code, language, isStreaming, hasGhost, analysis, onCopy }: CodePanelProps) {
  const hasCode = code.length > 0;
  const lines = hasCode ? code.split("\n") : [];

  return (
    <aside className="flex w-full flex-col border-l border-rule bg-ink-0 lg:h-[calc(100vh-57px)] lg:w-[420px]">
      {/* Header bar */}
      <header className="flex items-center justify-between border-b border-rule px-4 py-3">
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-cap text-paper-200">
          <span className="text-paper-300">file</span>
          <span className="text-paper-50">output.{EXT[language]}</span>
        </div>
        <div className="flex items-center gap-3">
          {isStreaming && (
            <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-cap text-lime">
              <span className="h-1.5 w-1.5 bg-lime cursor-blink" />
              streaming
            </span>
          )}
          <button
            onClick={onCopy}
            className="border border-transparent p-1.5 text-paper-200 transition-colors hover:border-rule-strong hover:text-paper-50"
            aria-label="Copy code"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Code body */}
      <div className="min-h-0 flex-1 overflow-auto">
        <pre className="font-mono text-[12.5px] leading-[1.8]">
          {hasCode ? (
            lines.map((line, i) => (
              <div key={i} className="flex gap-4 px-4">
                <span className="tabular w-8 shrink-0 select-none text-right text-paper-300">
                  {i + 1}
                </span>
                <span className="whitespace-pre text-paper-50">{line || " "}</span>
              </div>
            ))
          ) : (
            <div className="flex gap-4 px-4 py-4">
              <span className="tabular w-8 shrink-0 select-none text-right text-paper-300">1</span>
              <span className="text-paper-300">{`# the code stream will appear here.`}</span>
            </div>
          )}
          {isStreaming && (
            <div className="flex gap-4 px-4">
              <span className="tabular w-8 shrink-0 select-none text-right text-paper-300">
                {Math.max(1, lines.length + 1)}
              </span>
              <span className="cursor-blink inline-block h-[1.1em] w-[0.55em] bg-lime" />
            </div>
          )}
        </pre>

        {hasGhost && (
          <p className="mx-4 mt-3 border-l-2 border-amber bg-amber/5 px-3 py-2 font-mono text-[11px] text-amber">
            pending branch · ghosted until an end node closes the flow
          </p>
        )}

        <div className="px-4 pb-6">
          <AnalysisPanel markdown={analysis} />
        </div>
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between border-t border-rule px-4 py-2.5 font-mono text-[10px] uppercase tracking-cap text-paper-300">
        <span>gemini · 2.5 flash</span>
        <span className="tabular">
          {hasCode ? `${lines.length} lines` : "ready"}
        </span>
      </footer>
    </aside>
  );
}
