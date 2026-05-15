"use client";

import { Fragment } from "react";
import { Copy, FileCode2, Rocket } from "lucide-react";
import type { CodeLanguage } from "@/types/canvas";
import { AnalysisPanel } from "@/components/analysis/AnalysisPanel";

interface CodePanelProps {
  code: string;
  language: CodeLanguage;
  title: string;
  contextLabel: string;
  isStreaming: boolean;
  analysis?: string;
  onCopy: () => void;
  onPublish?: () => void;
  isPublishing?: boolean;
}

const keywordGroups = {
  control: new Set(["if", "else", "elif", "for", "while", "switch", "case", "break", "continue", "try", "catch"]),
  declaration: new Set(["def", "function", "class", "return", "const", "let", "var", "public", "private", "static", "void", "fn"]),
  literal: new Set(["true", "false", "null", "None"])
};

function getTokenClass(token: string) {
  const clean = token.trim();

  if (!clean) return "text-white/80";
  if (keywordGroups.control.has(clean)) return "text-sky-300";
  if (keywordGroups.declaration.has(clean)) return "text-emerald-300";
  if (keywordGroups.literal.has(clean)) return "text-violet-300";
  if (/^[0-9]+$/.test(clean)) return "text-amber-300";
  if (/^["'`].*["'`]$/.test(clean)) return "text-rose-300";
  if (/^[A-Z_]+$/.test(clean)) return "text-cyan-200";

  return "text-white/84";
}

function tokenizeLine(line: string) {
  return line.split(/(\s+|[()[\]{}:.,=+\-*/<>!]+)/g).filter((token) => token.length > 0);
}

export function CodePanel({
  code,
  language,
  title,
  contextLabel,
  isStreaming,
  analysis,
  onCopy,
  onPublish,
  isPublishing
}: CodePanelProps) {
  const lines = code.length > 0 ? code.split("\n") : ["# Your generated code stream will appear here."];

  return (
    <aside className="panel flex min-h-[420px] flex-col rounded-[2rem]">
      <div className="border-b border-[color:var(--border-soft)] px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Code output</p>
            <h2 className="mt-2 text-lg font-semibold text-[color:var(--text-primary)]">{title}</h2>
            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[color:var(--text-secondary)]">
              {contextLabel || "No problem context supplied yet."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onPublish ? (
              <button
                onClick={onPublish}
                disabled={isPublishing || code.length === 0}
                className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] px-4 py-2 text-sm font-semibold text-[color:var(--text-primary)] transition duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--surface-hover)] disabled:opacity-50"
              >
                <Rocket className="h-4 w-4 text-[color:var(--accent)]" />
                {isPublishing ? "Publishing..." : "Publish"}
              </button>
            ) : null}
            <button
              onClick={onCopy}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] text-[color:var(--text-secondary)] transition duration-200 hover:bg-[color:var(--surface-hover)] hover:text-[color:var(--text-primary)]"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-elevated)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--accent)]">
            <FileCode2 className="h-3.5 w-3.5" />
            {language}
          </div>
          <div className="rounded-full border border-[color:var(--border-soft)] px-3 py-1.5 text-xs text-[color:var(--text-secondary)]">
            {isStreaming ? "Streaming line-by-line" : "Ready for publish or remix"}
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-5 py-5">
        <div className="code-surface rounded-[1.5rem] border border-white/10 p-5 font-mono text-[13px] leading-7">
          {lines.map((line, lineIndex) => (
            <div key={`${line}-${lineIndex}`} className="group flex gap-4">
              <span className="w-7 shrink-0 select-none text-right text-white/30">{lineIndex + 1}</span>
              <div className="min-w-0 flex-1 whitespace-pre-wrap break-words">
                {tokenizeLine(line).map((token, tokenIndex) => (
                  <Fragment key={`${token}-${tokenIndex}`}>
                    <span className={token.trim() ? getTokenClass(token) : undefined}>{token}</span>
                  </Fragment>
                ))}
                {lineIndex === lines.length - 1 && isStreaming ? (
                  <span className="cursor-blink ml-1 inline-block h-4 w-2 bg-[color:var(--accent)] align-middle" />
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <AnalysisPanel markdown={analysis} />
      </div>
    </aside>
  );
}
