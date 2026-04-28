"use client";

import type { CodeLanguage } from "@/types/canvas";
import { cn } from "@/lib/utils";

const languages: CodeLanguage[] = ["python", "java", "cpp"];

export function LanguageSelector({
  value,
  onChange
}: {
  value: CodeLanguage;
  onChange: (language: CodeLanguage) => void;
}) {
  return (
    <div className="inline-grid grid-cols-3 rounded-lg border border-border bg-background p-1">
      {languages.map((language) => (
        <button
          key={language}
          onClick={() => onChange(language)}
          className={cn("rounded-md px-3 py-1.5 text-xs font-bold uppercase", value === language && "bg-primary text-white")}
        >
          {language}
        </button>
      ))}
    </div>
  );
}
