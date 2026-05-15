import Link from "next/link";
import { Bookmark, CheckCircle2, GitCommitHorizontal, MessageSquare, ThumbsUp } from "lucide-react";
import { FlowchartPreview } from "@/components/community/FlowchartPreview";

export interface FlowchartCardData {
  id: string;
  title: string;
  problem?: string | null;
  shapeCount: number;
  upvotes: number;
  saves: number;
  comments: number;
  views: number;
  authorName: string;
  authorUsername: string;
  authorAvatar?: string | null;
  isVerified: boolean;
  createdAt: string;
  snapshot: unknown;
}

export function FlowchartCard({ item }: { item: FlowchartCardData }) {
  return (
    <Link
      href={`/community/${item.id}`}
      className="group block rounded-[1.8rem] border border-[color:var(--border-soft)] bg-[color:var(--surface)] p-4 shadow-[var(--shadow-soft)] transition duration-200 hover:-translate-y-1 hover:border-[color:var(--border-strong)]"
    >
      <div className="grid gap-4 lg:grid-cols-[88px_minmax(0,1fr)]">
        <div className="flex flex-row gap-3 lg:flex-col lg:items-center">
          <div className="flex h-12 w-12 flex-col items-center justify-center rounded-[1rem] border border-[color:var(--border-soft)] bg-[color:var(--surface-elevated)] text-center">
            <ThumbsUp className="h-4 w-4 text-[color:var(--accent)]" />
            <span className="mt-1 text-xs font-bold text-[color:var(--text-primary)]">{item.upvotes}</span>
          </div>
          <div className="flex h-12 w-12 flex-col items-center justify-center rounded-[1rem] border border-[color:var(--border-soft)] bg-[color:var(--surface-elevated)] text-center">
            <MessageSquare className="h-4 w-4 text-[color:var(--text-secondary)]" />
            <span className="mt-1 text-xs font-bold text-[color:var(--text-primary)]">{item.comments}</span>
          </div>
          <div className="flex h-12 w-12 flex-col items-center justify-center rounded-[1rem] border border-[color:var(--border-soft)] bg-[color:var(--surface-elevated)] text-center">
            <Bookmark className="h-4 w-4 text-[color:var(--text-secondary)]" />
            <span className="mt-1 text-xs font-bold text-[color:var(--text-primary)]">{item.saves}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            {item.authorAvatar ? (
              <img src={item.authorAvatar} alt="" className="h-11 w-11 rounded-full border border-[color:var(--border-soft)] object-cover" />
            ) : (
              <div className="grid h-11 w-11 place-items-center rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-elevated)] text-sm font-semibold text-[color:var(--text-secondary)]">
                {item.authorName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold text-[color:var(--text-primary)]">{item.authorName}</p>
                <span className="text-xs text-[color:var(--text-muted)]">{item.authorUsername}</span>
                {item.isVerified ? <CheckCircle2 className="h-4 w-4 text-[color:var(--accent)]" /> : null}
              </div>
              <p className="mt-1 text-xs text-[color:var(--text-muted)]">{item.createdAt}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-[-0.03em] text-[color:var(--text-primary)]">{item.title}</h2>
            {item.problem ? (
              <p className="mt-2 line-clamp-3 text-sm leading-7 text-[color:var(--text-secondary)]">{item.problem}</p>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-[1.25rem] border border-[color:var(--border-soft)]">
            <FlowchartPreview snapshot={item.snapshot} heightClass="h-[220px]" />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[color:var(--text-secondary)]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--border-soft)] px-3 py-1.5">
              <GitCommitHorizontal className="h-3.5 w-3.5" />
              {item.shapeCount} elements
            </span>
            <span className="rounded-full border border-[color:var(--border-soft)] px-3 py-1.5">{item.views} views</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
