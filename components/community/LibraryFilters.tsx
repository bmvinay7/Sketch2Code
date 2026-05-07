"use client";

import { Search } from "lucide-react";

export function LibraryFilters({
  initialQuery = "",
  initialLanguage = "All",
  initialSort = "Newest"
}: {
  initialQuery?: string;
  initialLanguage?: string;
  initialSort?: string;
}) {
  return (
    <form className="grid gap-3 border-b border-border pb-6 md:grid-cols-[1fr_180px_200px]">
      <label className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <input
          name="q"
          defaultValue={initialQuery}
          placeholder="Search by problem name"
          className="w-full rounded-lg border border-border bg-surface py-3 pl-10 pr-3 text-sm text-text-primary outline-none focus:border-accent/60"
        />
      </label>
      <select defaultValue={initialLanguage} name="language" className="rounded-lg border border-border bg-surface px-3 text-sm text-text-primary outline-none">
        <option>All</option>
        <option>Python</option>
        <option>Java</option>
        <option>C++</option>
      </select>
      <select defaultValue={initialSort} name="sort" className="rounded-lg border border-border bg-surface px-3 text-sm text-text-primary outline-none">
        <option>Newest</option>
        <option>Most Upvoted</option>
        <option>Most Saved</option>
      </select>
    </form>
  );
}
