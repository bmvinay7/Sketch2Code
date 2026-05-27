"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, type ChangeEvent } from "react";
import { cn } from "@/lib/utils";

interface LibraryFiltersProps {
  defaultQuery: string;
  defaultLanguage: string;
  defaultSort: "newest" | "upvotes" | "saves";
}

const LANGUAGE_OPTIONS = [
  { value: "All", label: "all" },
  { value: "python", label: "python" },
  { value: "java", label: "java" },
  { value: "cpp", label: "c++" }
];

const SORT_OPTIONS = [
  { value: "newest", label: "newest" },
  { value: "upvotes", label: "most upvoted" },
  { value: "saves", label: "most saved" }
] as const;

function languageDefault(value: string) {
  const lower = value.toLowerCase();
  if (lower === "python" || lower === "java" || lower === "cpp") return lower;
  return "All";
}

export function LibraryFilters({ defaultQuery, defaultLanguage, defaultSort }: LibraryFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function pushParams(next: { q?: string; language?: string; sort?: string }) {
    const url = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (
        value === undefined ||
        value === "" ||
        (key === "language" && value === "All") ||
        (key === "sort" && value === "newest")
      ) {
        url.delete(key);
      } else {
        url.set(key, value);
      }
    }
    const qs = url.toString();
    startTransition(() => {
      router.push(qs ? `/community?${qs}` : "/community");
    });
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    pushParams({
      q: String(form.get("q") ?? ""),
      language: String(form.get("language") ?? "All"),
      sort: String(form.get("sort") ?? "newest")
    });
  }

  function onSelectChange(name: "language" | "sort") {
    return (event: ChangeEvent<HTMLSelectElement>) => {
      pushParams({ [name]: event.target.value });
    };
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "grid items-stretch border-y border-rule transition-opacity md:grid-cols-[1fr_auto_auto]",
        pending && "opacity-60"
      )}
    >
      <label className="relative flex items-center border-r border-rule px-5">
        <Search className="absolute left-5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-paper-300" />
        <input
          name="q"
          defaultValue={defaultQuery}
          placeholder="search by title or problem"
          className="h-14 w-full bg-transparent pl-7 font-mono text-[13px] text-paper-50 outline-none placeholder:text-paper-300"
        />
      </label>
      <Selector
        name="language"
        label="language"
        defaultValue={languageDefault(defaultLanguage)}
        options={LANGUAGE_OPTIONS}
        onChange={onSelectChange("language")}
      />
      <Selector
        name="sort"
        label="sort"
        defaultValue={defaultSort}
        options={[...SORT_OPTIONS]}
        onChange={onSelectChange("sort")}
        last
      />
      <button type="submit" className="sr-only">
        Search
      </button>
    </form>
  );
}

function Selector({
  name,
  label,
  defaultValue,
  options,
  onChange,
  last
}: {
  name: "language" | "sort";
  label: string;
  defaultValue: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  last?: boolean;
}) {
  return (
    <label
      className={cn(
        "relative flex items-center gap-3 px-5",
        !last && "md:border-r md:border-rule"
      )}
    >
      <span className="font-mono text-[10px] uppercase tracking-cap text-paper-300">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        onChange={onChange}
        className="h-14 cursor-pointer appearance-none bg-transparent pr-6 font-mono text-[13px] text-paper-50 outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-ink-50 text-paper-50">
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none -ml-5 text-paper-300">▾</span>
    </label>
  );
}
