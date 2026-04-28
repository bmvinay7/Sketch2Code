"use client";

import { CircleDot, Diamond, Download, GitBranch, Play, Square, Terminal } from "lucide-react";
import type { CodeLanguage, ShapeType } from "@/types/canvas";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const languages: Array<{ label: string; value: CodeLanguage }> = [
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" }
];

interface ShapeToolbarProps {
  selectedShape: ShapeType;
  language: CodeLanguage;
  problemContext: string;
  canAnalyze: boolean;
  canTrace: boolean;
  isBusy: boolean;
  onShapeSelect: (type: ShapeType) => void;
  onLanguageChange: (language: CodeLanguage) => void;
  onContextChange: (value: string) => void;
  onAnalyze: () => void;
  onTrace: () => void;
}

export function ShapeToolbar(props: ShapeToolbarProps) {
  return (
    <aside className="flex h-[calc(100svh-4rem)] w-full flex-col border-r border-border bg-surface/70 p-4 lg:w-60">
      <label className="text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">Language</label>
      <div className="mt-3 grid grid-cols-3 rounded-lg border border-border bg-background p-1">
        {languages.map((item) => (
          <button
            key={item.value}
            className={cn(
              "rounded-md px-2 py-2 text-xs font-bold text-text-secondary transition",
              props.language === item.value && "bg-primary text-white"
            )}
            onClick={() => props.onLanguageChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <label className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-text-muted">
        Problem context
      </label>
      <textarea
        value={props.problemContext}
        onChange={(event) => props.onContextChange(event.target.value)}
        placeholder="What problem are you solving?"
        className="mt-3 min-h-28 resize-none rounded-lg border border-border bg-background p-3 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent/60"
      />
      <div className="mt-auto space-y-3 pt-6">
        <Button onClick={props.onAnalyze} disabled={!props.canAnalyze || props.isBusy} className="w-full">
          <Terminal className="mr-2 inline h-4 w-4" />
          Done - Analyze
        </Button>
        <Button onClick={props.onTrace} disabled={!props.canTrace || props.isBusy} className="w-full">
          <Play className="mr-2 inline h-4 w-4" />
          Trace Mode
        </Button>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <GitBranch className="h-3.5 w-3.5 text-accent" />
          Draw lines and connect elements with Excalidraw tools.
        </div>
      </div>
    </aside>
  );
}
