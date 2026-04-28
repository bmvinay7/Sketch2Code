"use client";

import { Copy, FileCode2 } from "lucide-react";
import type { CodeLanguage } from "@/types/canvas";
import { AnalysisPanel } from "@/components/analysis/AnalysisPanel";

const keywords = ["def", "if", "else", "for", "while", "return", "class", "public", "static", "void", "int"];

function colorize(token: string) {
  if (keywords.includes(token.trim())) return "text-accent";
  if (/^[0-9]+$/.test(token.trim())) return "text-warning";
  if (token.includes('"') || token.includes("'")) return "text-success";
  return "text-text-secondary";
}

interface CodePanelProps {
  code: string;
  language: CodeLanguage;
  isStreaming: boolean;
  hasGhost: boolean;
  analysis?: string;
  onCopy: () => void;
}

export function CodePanel({ code, language, isStreaming, hasGhost, analysis, onCopy }: CodePanelProps) {
  const chars = code.length > 0 ? code.split("") : ["#", " ", "C", "o", "d", "e", " ", "s", "t", "r", "e", "a", "m", " ", "w", "i", "l", "l", " ", "a", "p", "p", "e", "a", "r", " ", "h", "e", "r", "e"];

  return (
    <aside className="flex h-[calc(100svh-4rem)] w-full flex-col border-l border-border bg-surface/70 lg:w-[380px]">
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-3">
          <FileCode2 className="h-5 w-5 text-accent" />
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-bold uppercase text-primary">{language}</span>
        </div>
        <button onClick={onCopy} className="rounded-md p-2 text-text-secondary transition hover:bg-surface-raised hover:text-text-primary">
          <Copy className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        <pre className={`min-h-72 whitespace-pre-wrap border-l-2 bg-background/70 p-4 font-mono text-sm leading-7 ${hasGhost ? "border-warning opacity-70" : "border-accent/50"}`}>
          {chars.map((char, index) => (
            <span key={`${char}-${index}`} className={colorize(char)} style={{ animationDelay: `${index * 8}ms` }}>
              {char}
            </span>
          ))}
          {isStreaming && <span className="cursor-blink ml-1 inline-block h-4 w-2 bg-accent align-middle" />}
        </pre>
        {hasGhost && <p className="mt-3 text-xs text-warning">Pending branch code is ghosted until an End node closes the flow.</p>}
        <AnalysisPanel markdown={analysis} />
      </div>
    </aside>
  );
}
