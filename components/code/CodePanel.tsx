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
    <aside className="flex h-[calc(100svh-4rem)] mt-16 w-full flex-col border-l border-white/10 bg-[#08111f]/60 backdrop-blur-md lg:w-[420px]">
      <div className="flex items-center justify-between border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <FileCode2 className="h-5 w-5 text-accent" />
          <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-widest text-accent">{language}</span>
        </div>
        <button onClick={onCopy} className="rounded-md p-2 text-text-secondary transition hover:bg-white/5 hover:text-text-primary">
          <Copy className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-6">
        <pre className="min-h-[280px] whitespace-pre-wrap bg-black/40 border border-white/10 rounded-xl p-6 font-mono text-[0.85rem] leading-[1.65] text-white/85">
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
