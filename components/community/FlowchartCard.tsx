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
  tags?: string[];
}

export function FlowchartCard({ item }: { item: FlowchartCardData }) {
  return (
    <Link
      href={`/community/${item.id}`}
      className="group block rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 hover:-translate-y-0.5 hover:border-[color:var(--color-dark-surface)]"
    >
      <div className="grid gap-3 md:grid-cols-[56px_minmax(0,1fr)]">
        <div className="flex flex-row gap-2 rounded-xl bg-[color:var(--color-bg)] p-2 md:flex-col md:items-center">
          <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg text-center">
            <ThumbsUp className="h-4 w-4 text-[color:var(--color-accent)]" strokeWidth={1.5} />
            <span className="mt-1 text-xs font-bold text-[color:var(--color-text-primary)]">{item.upvotes}</span>
          </div>
          <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg text-center">
            <MessageSquare className="h-4 w-4 text-[color:var(--color-text-secondary)]" strokeWidth={1.5} />
            <span className="mt-1 text-xs font-bold text-[color:var(--color-text-primary)]">{item.comments}</span>
          </div>
          <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg text-center">
            <Bookmark className="h-4 w-4 text-[color:var(--color-text-secondary)]" strokeWidth={1.5} />
            <span className="mt-1 text-xs font-bold text-[color:var(--color-text-primary)]">{item.saves}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-3 px-1">
          <div className="flex items-start gap-3">
            {item.authorAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.authorAvatar} alt="" className="h-10 w-10 rounded-full border border-[color:var(--color-border)] object-cover" />
            ) : (
              <div className="grid h-10 w-10 place-items-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-sm font-semibold text-[color:var(--color-text-secondary)]">
                {item.authorName.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold text-[color:var(--color-text-primary)]">{item.authorName}</p>
                <span className="text-xs text-[color:var(--color-text-secondary)]">{item.authorUsername}</span>
                {item.isVerified ? <CheckCircle2 className="h-4 w-4 text-[color:var(--color-accent)]" strokeWidth={1.5} /> : null}
              </div>
              <p className="mt-1 text-xs text-[color:var(--color-text-secondary)]">{item.createdAt}</p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-[color:var(--color-text-primary)]">{item.title}</h2>
            {item.problem ? (
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-[color:var(--color-text-secondary)]">{item.problem}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--color-text-secondary)]">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[color:var(--color-border)] px-3 py-1.5">
              <GitCommitHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} />
              {item.shapeCount} elements
            </span>
            <span className="rounded-full border border-[color:var(--color-border)] px-3 py-1.5">{item.views} views</span>
            {(item.tags ?? []).slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full border border-[color:var(--color-border)] px-3 py-1.5">{tag}</span>
            ))}
          </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg)]">
            <FlowchartPreview snapshot={item.snapshot} heightClass="h-[260px]" />
          </div>
        </div>
      </div>
    </Link>
  );
}
