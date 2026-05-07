import Link from "next/link";
import { Bookmark, CheckCircle2, GitCommitHorizontal, MessageSquare, ThumbsUp } from "lucide-react";

export interface FlowchartCardData {
  id: string;
  title: string;
  problem?: string | null;
  language: string;
  shapeCount: number;
  upvotes: number;
  saves: number;
  comments: number;
  authorName: string;
  authorAvatar?: string;
  isVerified: boolean;
}

export function FlowchartCard({ item }: { item: FlowchartCardData }) {
  return (
    <Link
      href={`/community/${item.id}`}
      className="group block rounded-lg border border-border bg-surface/80 p-4 transition hover:-translate-y-1 hover:border-accent/60 hover:shadow-glow"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-text-muted">{item.authorName}</p>
          <h2 className="mt-2 line-clamp-2 text-base font-bold text-text-primary">{item.title}</h2>
          {item.problem ? <p className="mt-2 line-clamp-2 text-sm text-text-secondary">{item.problem}</p> : null}
          <span className="mt-3 inline-flex rounded-full bg-primary/15 px-3 py-1 text-xs font-bold uppercase text-primary">
            {item.language}
          </span>
        </div>
        {item.isVerified && <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />}
      </div>
      <div className="mt-8 flex items-center justify-between text-xs text-text-muted">
        <span className="flex items-center gap-1.5">
          <GitCommitHorizontal className="h-4 w-4" />
          {item.shapeCount} shapes
        </span>
        <span className="flex items-center gap-1.5">
          <ThumbsUp className="h-4 w-4" />
          {item.upvotes}
        </span>
        <span className="flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4" />
          {item.comments}
        </span>
        <span className="flex items-center gap-1.5">
          <Bookmark className="h-4 w-4" />
          {item.saves}
        </span>
      </div>
    </Link>
  );
}
