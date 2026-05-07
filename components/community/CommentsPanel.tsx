"use client";

import { useMemo, useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CommentItem {
  id: string;
  body: string;
  createdAt: string;
  user: {
    name: string;
    avatar: string | null;
  };
}

interface CommentsPanelProps {
  postId: string;
  initialComments: CommentItem[];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

export function CommentsPanel({ postId, initialComments }: CommentsPanelProps) {
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const orderedComments = useMemo(
    () => [...comments].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt)),
    [comments]
  );

  async function submitComment() {
    const value = body.trim();
    if (!value) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/community/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: value })
      });

      if (!response.ok) return;

      const payload = (await response.json()) as { comment: CommentItem };
      setComments((current) => [...current, payload.comment]);
      setBody("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(8,15,28,0.76)] p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">Discussion</p>
          <h2 className="mt-2 text-2xl font-black text-text-primary">Comments</h2>
        </div>
        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-text-secondary">
          {orderedComments.length} total
        </span>
      </div>

      <div className="mt-5 flex gap-3">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Add a practical note, question, or correction."
          className="min-h-28 flex-1 resize-none rounded-2xl border border-white/10 bg-black/25 p-4 text-sm text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent/50"
        />
        <Button onClick={submitComment} disabled={submitting || body.trim().length === 0} className="self-end">
          <Send className="h-4 w-4" />
          Post
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        {orderedComments.length > 0 ? (
          orderedComments.map((comment) => (
            <article key={comment.id} className="rounded-2xl border border-white/8 bg-black/20 p-4">
              <div className="flex items-center gap-3">
                {comment.user.avatar ? (
                  <img src={comment.user.avatar} alt="" className="h-10 w-10 rounded-full border border-white/10 object-cover" />
                ) : (
                  <div className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-sm font-semibold text-text-secondary">
                    {comment.user.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold text-text-primary">{comment.user.name}</p>
                  <p className="text-xs text-text-muted">{formatDate(comment.createdAt)}</p>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-text-secondary">{comment.body}</p>
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-text-secondary">
            No comments yet. Start the discussion with the exact issue or improvement you noticed in this flowchart.
          </div>
        )}
      </div>
    </section>
  );
}
