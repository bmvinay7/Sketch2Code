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
    <aside className="flex h-[calc(100svh-4rem)] mt-16 w-full flex-col border-r border-white/10 bg-[#08111f]/60 backdrop-blur-md p-6 lg:w-72">
      <label className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">Language</label>
      <div className="mt-4 flex flex-col gap-2">
        {languages.map((item) => (
          <button
            key={item.value}
            className={cn(
              "rounded-lg px-4 py-3 text-sm font-medium transition-colors text-left border",
              props.language === item.value 
                ? "bg-white/10 border-white/30 text-text-primary" 
                : "bg-black/20 border-white/5 text-text-secondary hover:bg-white/5 hover:text-text-primary"
            )}
            onClick={() => props.onLanguageChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <label className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">
        Problem context
      </label>
      <textarea
        value={props.problemContext}
        onChange={(event) => props.onContextChange(event.target.value)}
        placeholder="What problem are you solving?"
        className="mt-4 min-h-[140px] resize-none rounded-xl border border-white/10 bg-black/40 p-4 font-body text-[0.95rem] text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent focus:bg-white/5"
      />
      <div className="mt-auto space-y-4 pt-8">
        <Button onClick={props.onAnalyze} disabled={!props.canAnalyze || props.isBusy} className="w-full justify-center">
          <Terminal className="mr-2 inline h-4 w-4" />
          Analyze Canvas
        </Button>
        <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-black/20 p-4 text-xs text-text-secondary leading-relaxed">
          <GitBranch className="h-4 w-4 shrink-0 text-accent mt-0.5" />
          <p>Draw lines and connect elements with Excalidraw tools.</p>
        </div>
      </div>
    </aside>
  );
}
