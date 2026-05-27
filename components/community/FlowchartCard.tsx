import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

export interface FlowchartCardData {
  id: string;
  problem: string;
  language: string;
  lineCount: number;
  upvotes: number;
  authorName: string;
  authorAvatar?: string;
  tags: string[];
  isVerified: boolean;
}

interface Props {
  item: FlowchartCardData;
  index: number;
  total: number;
}

export function FlowchartCard({ item, index, total }: Props) {
  return (
    <Link
      href={`/community/${item.id}`}
      className="group relative block border border-rule bg-ink-0 transition-colors hover:bg-ink-50"
    >
      {/* Header strip */}
      <header className="flex items-center justify-between border-b border-rule px-5 py-3">
        <span className="index-tag">
          {String(index).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-cap text-paper-300">
          {item.language}
        </span>
      </header>

      {/* Body */}
      <div className="px-5 py-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-mono text-[18px] font-bold lowercase leading-tight tracking-tightest text-paper-50 line-clamp-2">
            {item.problem}
          </h3>
          {item.isVerified && (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-lime" aria-label="verified" />
          )}
        </div>

        {item.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[10px] uppercase tracking-cap text-paper-200">
            {item.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="before:mr-1 before:text-paper-300 before:content-['#']">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer meta */}
      <footer className="flex items-center justify-between border-t border-rule px-5 py-3 font-mono text-[10px] uppercase tracking-cap text-paper-200">
        <span className="tabular">
          <span className="text-paper-300">lines </span>
          <span className="text-paper-50">{item.lineCount}</span>
        </span>
        <span className="tabular">
          <span className="text-paper-300">↑ </span>
          <span className="text-paper-50">{item.upvotes}</span>
        </span>
        <span className="truncate">
          <span className="text-paper-300">by </span>
          <span className="text-paper-50">{item.authorName}</span>
        </span>
      </footer>

      {/* Hover affordance */}
      <span className="pointer-events-none absolute right-4 top-3.5 opacity-0 transition-opacity group-hover:opacity-100">
        <ArrowUpRight className="h-3.5 w-3.5 text-lime" />
      </span>
    </Link>
  );
}
