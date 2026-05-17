"use client";

import type { CodeLanguage } from "@/types/canvas";

const popular: Array<{ label: string; value: CodeLanguage }> = [
  { label: "Python", value: "python" },
  { label: "C++", value: "cpp" },
  { label: "Java", value: "java" },
  { label: "Go", value: "go" }
];

const remaining: Array<{ label: string; value: CodeLanguage }> = [
  { label: "C", value: "c" },
  { label: "C#", value: "csharp" },
  { label: "Dart", value: "dart" },
  { label: "JavaScript", value: "javascript" },
  { label: "Kotlin", value: "kotlin" },
  { label: "PHP", value: "php" },
  { label: "Ruby", value: "ruby" },
  { label: "Rust", value: "rust" },
  { label: "Scala", value: "scala" },
  { label: "Swift", value: "swift" },
  { label: "TypeScript", value: "typescript" }
];

export function LanguageSelector({
  value,
  onChange
}: {
  value: CodeLanguage;
  onChange: (language: CodeLanguage) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as CodeLanguage)}
      className="h-10 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 text-sm font-semibold text-[color:var(--color-text-primary)] outline-none focus:border-[color:var(--color-accent)]"
    >
      <optgroup label="Most Popular for DSA">
        {popular.map((language) => (
          <option key={language.value} value={language.value}>
            {language.label}
          </option>
        ))}
      </optgroup>
      <optgroup label="All languages">
        {remaining.map((language) => (
          <option key={language.value} value={language.value}>
            {language.label}
          </option>
        ))}
      </optgroup>
    </select>
  );
}
