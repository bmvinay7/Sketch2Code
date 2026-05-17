"use client";

import Link from "next/link";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { FlowchartPreview } from "@/components/community/FlowchartPreview";

type Tab = "saved" | "posts" | "activity";

interface SavedCanvas {
  id: string;
  title: string;
  problem: string | null;
  language: string;
  updatedAt: string;
  shapes: unknown;
}

interface CommunityPostItem {
  id: string;
  title: string;
  problem: string | null;
  language: string;
  createdAt: string;
  shapes: unknown;
  canDelete?: boolean;
}

export function ProfileTabs({
  savedCanvases,
  communityPosts,
  activity,
  ownProfile
}: {
  savedCanvases: SavedCanvas[];
  communityPosts: CommunityPostItem[];
  activity: string[];
  ownProfile: boolean;
}) {
  const [active, setActive] = useState<Tab>("saved");
  const [posts, setPosts] = useState(communityPosts);

  async function deletePost(postId: string) {
    const response = await fetch(`/api/community/${postId}`, { method: "DELETE" });
    if (response.ok) setPosts((current) => current.filter((post) => post.id !== postId));
  }

  return (
    <section className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
      <div className="flex gap-2 overflow-x-auto">
        {[
          ["saved", "Saved Canvases"],
          ["posts", "Community Posts"],
          ["activity", "Activity"]
        ].map(([value, label]) => (
          <button
            key={value}
            onClick={() => setActive(value as Tab)}
            className={`rounded-xl border px-4 py-2 text-sm font-medium ${
              active === value
                ? "border-transparent bg-[color:var(--color-dark-surface)] text-[color:var(--color-text-on-dark)]"
                : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text-secondary)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {active === "saved" ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {savedCanvases.length ? savedCanvases.map((canvas) => (
            <article key={canvas.id} className="rounded-2xl border border-[color:var(--color-border)] p-4">
              <FlowchartPreview snapshot={canvas.shapes} heightClass="h-[180px]" />
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-[color:var(--color-text-primary)]">{canvas.title}</h3>
                  <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">{canvas.problem || "Saved canvas"}</p>
                </div>
                <span className="rounded-full border border-[color:var(--color-border)] px-3 py-1 font-mono text-xs text-[color:var(--color-accent)]">
                  {canvas.language}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-[color:var(--color-text-secondary)]">Modified {canvas.updatedAt}</p>
                <Link href={`/canvas/${canvas.id}`} className="rounded-full bg-[color:var(--color-accent)] px-4 py-2 text-sm font-semibold text-[color:var(--color-text-on-dark)]">
                  Open
                </Link>
              </div>
            </article>
          )) : (
            <div className="rounded-2xl border border-dashed border-[color:var(--color-border)] p-8 text-center text-sm text-[color:var(--color-text-secondary)]">
              {ownProfile ? "No saved canvases yet." : "No public saved canvases are visible."}
            </div>
          )}
        </div>
      ) : null}

      {active === "posts" ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {posts.length ? posts.map((post) => (
            <article key={post.id} className="rounded-2xl border border-[color:var(--color-border)] p-4">
              <FlowchartPreview snapshot={post.shapes} heightClass="h-[180px]" />
              <div className="mt-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-[color:var(--color-text-primary)]">{post.title}</h3>
                  <p className="mt-1 text-sm text-[color:var(--color-text-secondary)]">{post.problem || "Published canvas"}</p>
                </div>
                <span className="rounded-full border border-[color:var(--color-border)] px-3 py-1 font-mono text-xs text-[color:var(--color-accent)]">
                  {post.language}
                </span>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <Link href={`/community/${post.id}`} className="rounded-full bg-[color:var(--color-accent)] px-4 py-2 text-sm font-semibold text-[color:var(--color-text-on-dark)]">
                  Open post
                </Link>
                {post.canDelete ? (
                  <button onClick={() => void deletePost(post.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--color-border)] text-[color:var(--color-text-secondary)]">
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                ) : null}
              </div>
            </article>
          )) : (
            <div className="rounded-2xl border border-dashed border-[color:var(--color-border)] p-8 text-center text-sm text-[color:var(--color-text-secondary)]">
              No community posts yet.
            </div>
          )}
        </div>
      ) : null}

      {active === "activity" ? (
        <div className="mt-5 space-y-3">
          {activity.map((item) => (
            <div key={item} className="rounded-xl border border-[color:var(--color-border)] px-4 py-3 text-sm text-[color:var(--color-text-secondary)]">
              {item}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}
