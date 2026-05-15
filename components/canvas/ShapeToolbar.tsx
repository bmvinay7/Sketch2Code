"use client";

import { Download, GitBranch, Save, ScanLine, Terminal } from "lucide-react";
import type { CodeLanguage, ShapeType } from "@/types/canvas";
import { cn } from "@/lib/utils";

const languages: Array<{ label: string; value: CodeLanguage }> = [
  { label: "Py", value: "python" },
  { label: "TS", value: "typescript" },
  { label: "JS", value: "javascript" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" },
  { label: "Go", value: "go" },
  { label: "Rust", value: "rust" },
  { label: "Ruby", value: "ruby" },
  { label: "PHP", value: "php" }
];

interface ShapeToolbarProps {
  selectedShape: ShapeType;
  language: CodeLanguage;
  title: string;
  problemContext: string;
  inferredContext: string;
  canAnalyze: boolean;
  isBusy: boolean;
  isSaving: boolean;
  onShapeSelect: (type: ShapeType) => void;
  onLanguageChange: (language: CodeLanguage) => void;
  onContextChange: (value: string) => void;
  onAnalyze: () => void;
  onAnalyzeImage?: (base64: string) => void;
  onSave: () => void;
}

export function ShapeToolbar(props: ShapeToolbarProps) {
  return (
    <aside className="flex h-full min-w-0 flex-col overflow-y-auto p-3">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase text-[color:var(--text-muted)]">Controls</p>
          <p className="text-sm font-semibold text-[color:var(--text-primary)]">Parse settings</p>
        </div>
        <ScanLine className="h-4 w-4 text-[color:var(--accent)]" />
      </div>

      <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-2">
        <p className="px-1 pb-2 text-xs font-bold uppercase text-[color:var(--text-muted)]">Language</p>
        <div className="grid grid-cols-3 gap-1">
          {languages.map((item) => (
            <button
              type="button"
              key={item.value}
              onClick={() => props.onLanguageChange(item.value)}
              className={cn(
                "h-8 rounded-md text-xs font-bold transition",
                props.language === item.value
                  ? "bg-[color:var(--accent)] text-[color:var(--accent-contrast)]"
                  : "text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-hover)] hover:text-[color:var(--text-primary)]"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <label className="mt-3 text-xs font-bold uppercase text-[color:var(--text-muted)]">Problem context</label>
      <textarea
        value={props.problemContext}
        onChange={(event) => props.onContextChange(event.target.value)}
        placeholder="Optional. Board labels can infer context."
        className="mt-2 min-h-32 resize-none rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-3 text-sm leading-6 text-[color:var(--text-primary)] outline-none placeholder:text-[color:var(--text-muted)] focus:border-[color:var(--accent)]"
      />

      <div className="mt-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-[color:var(--text-primary)]">
          <GitBranch className="h-4 w-4 text-[color:var(--accent-2)]" />
          Inferred brief
        </div>
        <p className="mt-2 text-xs leading-5 text-[color:var(--text-secondary)]">
          {props.inferredContext || "Waiting for readable labels on the canvas."}
        </p>
      </div>

      <input
        type="file"
        accept="image/*"
        className="hidden"
        id="image-upload"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;

          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(",")[1];
            props.onAnalyzeImage?.(base64);
          };
          reader.readAsDataURL(file);
        }}
      />

      <div className="mt-auto grid gap-2 pt-3">
        <button
          type="button"
          onClick={props.onAnalyze}
          disabled={!props.canAnalyze || props.isBusy}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[color:var(--accent)] px-3 text-sm font-semibold text-[color:var(--accent-contrast)] disabled:opacity-50"
        >
          <Terminal className="h-4 w-4" />
          {props.isBusy ? "Generating" : "Generate code"}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className="control inline-flex items-center justify-center gap-2 px-3 text-sm font-semibold"
            disabled={props.isBusy}
            onClick={() => document.getElementById("image-upload")?.click()}
          >
            <Download className="h-4 w-4 text-[color:var(--accent-2)]" />
            Upload
          </button>
          <button
            type="button"
            className="control inline-flex items-center justify-center gap-2 px-3 text-sm font-semibold"
            disabled={props.isSaving}
            onClick={props.onSave}
          >
            <Save className="h-4 w-4 text-[color:var(--accent-2)]" />
            Save
          </button>
        </div>
      </div>
    </aside>
  );
}
