"use client";

import { useState } from "react";
import { Bookmark, MessageSquare, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CommunityActionsProps {
  postId: string;
  initialUpvotes: number;
  initialSaved: boolean;
  commentCount: number;
}

export function CommunityActions({ postId, initialUpvotes, initialSaved, commentCount }: CommunityActionsProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [saved, setSaved] = useState(initialSaved);
  const [busy, setBusy] = useState<"save" | "upvote" | null>(null);

  const [voteValue, setVoteValue] = useState<number>(0);

  async function toggleSave() {
    setBusy("save");
    try {
      const response = await fetch(`/api/community/${postId}/save`, { method: "POST" });
      if (!response.ok) return;
      const payload = (await response.json()) as { saved: boolean };
      setSaved(payload.saved);
    } finally {
      setBusy(null);
    }
  }

  async function handleVote(value: number) {
    setBusy("upvote");
    try {
      const response = await fetch(`/api/community/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value })
      });
      if (!response.ok) return;
      const data = await response.json();
      
      if (data.message === "Vote removed") {
        setUpvotes((prev) => prev - value);
        setVoteValue(0);
      } else if (data.message === "Vote changed") {
        setUpvotes((prev) => prev + (value * 2));
        setVoteValue(value);
      } else if (data.message === "Vote added") {
        setUpvotes((prev) => prev + value);
        setVoteValue(value);
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr]">
      <Button onClick={toggleSave} disabled={busy !== null} className="w-full justify-center">
        <Bookmark className="h-4 w-4" />
        {saved ? "Saved" : "Save"}
      </Button>
      
      <div className="flex w-full items-center justify-between rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-elevated)] p-1">
        <button 
          onClick={() => handleVote(1)} 
          disabled={busy !== null}
          className={`rounded-full p-2 transition-colors ${voteValue === 1 ? 'bg-[color:var(--surface-strong)] text-[color:var(--text-primary)]' : 'text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-strong)] hover:text-[color:var(--text-primary)]'}`}
        >
          <ThumbsUp className="h-4 w-4" />
        </button>
        <span className="px-3 text-sm font-semibold text-[color:var(--text-primary)]">{upvotes}</span>
        <button 
          onClick={() => handleVote(-1)} 
          disabled={busy !== null}
          className={`rounded-full p-2 transition-colors ${voteValue === -1 ? 'bg-[color:var(--surface-strong)] text-[color:var(--text-primary)]' : 'text-[color:var(--text-secondary)] hover:bg-[color:var(--surface-strong)] hover:text-[color:var(--text-primary)]'}`}
        >
          <ThumbsUp className="h-4 w-4 rotate-180" />
        </button>
      </div>

      <div className="inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-elevated)] px-5 py-3 text-sm text-[color:var(--text-secondary)]">
        <MessageSquare className="h-4 w-4 text-[color:var(--accent)]" />
        {commentCount}
      </div>
    </div>
  );
}
