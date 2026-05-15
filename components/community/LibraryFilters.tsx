"use client";

import { Search } from "lucide-react";

export function LibraryFilters({
  initialQuery = "",
  initialSort = "Latest"
}: {
  initialQuery?: string;
  initialSort?: string;
}) {
  return (
    <form className="grid gap-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] p-2 md:grid-cols-[1fr_190px]">
      <label className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--text-muted)]" />
        <input
          name="q"
          defaultValue={initialQuery}
          placeholder="Search titles, prompts, or algorithm ideas"
          className="h-10 w-full rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface-elevated)] pl-11 pr-4 text-sm text-[color:var(--text-primary)] outline-none focus:border-[color:var(--accent)]"
        />
      </label>
      <select
        defaultValue={initialSort}
        name="sort"
        className="h-10 rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface-elevated)] px-3 text-sm font-semibold text-[color:var(--text-primary)] outline-none"
      >
        <option>Latest</option>
        <option>Most Upvoted</option>
        <option>Most Saved</option>
      </select>
    </form>
  );
}
