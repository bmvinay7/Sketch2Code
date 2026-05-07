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

  async function upvote() {
    setBusy("upvote");
    try {
      const response = await fetch(`/api/community/${postId}/upvote`, { method: "POST" });
      if (!response.ok) return;
      const payload = (await response.json()) as { post?: { upvotes: number } };
      if (typeof payload.post?.upvotes === "number") {
        setUpvotes(payload.post.upvotes);
      }
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Button onClick={toggleSave} disabled={busy !== null} className="w-full justify-center">
        <Bookmark className="h-4 w-4" />
        {saved ? "Saved" : "Save"}
      </Button>
      <Button onClick={upvote} disabled={busy !== null} className="w-full justify-center">
        <ThumbsUp className="h-4 w-4" />
        {upvotes} Upvotes
      </Button>
      <div className="inline-flex items-center justify-center gap-2 rounded-btn border border-white/10 bg-black/20 px-5 py-3 text-sm text-text-secondary">
        <MessageSquare className="h-4 w-4 text-accent" />
        {commentCount} Comments
      </div>
    </div>
  );
}
