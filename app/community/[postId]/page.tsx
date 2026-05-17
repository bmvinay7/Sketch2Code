import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { Bookmark, Eye, MessageSquare, ThumbsUp } from "lucide-react";
import { notFound } from "next/navigation";
import { CommentsPanel } from "@/components/community/CommentsPanel";
import { CommunityActions } from "@/components/community/CommunityActions";
import { FlowchartPreview } from "@/components/community/FlowchartPreview";
import { RemixButton } from "@/components/community/RemixButton";
import { buildCommunityUsername, buildDisplayHandle } from "@/lib/community";
import { listComments } from "@/lib/community-comments";
import { prisma } from "@/lib/prisma";

export default async function CommunityPostPage({ params }: { params: { postId: string } }) {
  const session = await auth();
  const viewerPromise = session.userId ? prisma.user.findUnique({ where: { clerkId: session.userId } }) : Promise.resolve(null);

  const [post, viewer, comments] = await Promise.all([
    prisma.communityPost.update({
      where: { id: params.postId },
      data: { views: { increment: 1 } },
      include: {
        flowchart: { include: { user: true } },
        saves: true
      }
    }).catch(() => null),
    viewerPromise,
    listComments(params.postId)
  ]);

  if (!post) notFound();

  const isSaved = viewer ? post.saves.some((save) => save.userId === viewer.id) : false;
  const canResumeSession = viewer?.id === post.flowchart.userId;
  const authorName = buildDisplayHandle(post.flowchart.user.name, post.flowchart.user.email);
  const authorUsername = buildCommunityUsername(post.flowchart.user.name, post.flowchart.user.email);

  return (
    <section className="px-[clamp(24px,5vw,60px)] py-8">
      <div className="mx-auto max-w-[1100px] space-y-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-4xl">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.06em] text-[color:var(--color-accent)]">Community post</p>
                <h1 className="mt-3 font-display text-[clamp(2.2rem,4vw,3.5rem)] font-bold leading-[1.05] tracking-[-0.02em] text-[color:var(--color-text-primary)]">
                  {post.flowchart.title}
                </h1>
                <p className="mt-4 max-w-[62ch] text-base leading-8 text-[color:var(--color-text-secondary)]">
                  {post.flowchart.problem || "Published algorithm canvas."}
                </p>
              </div>

              <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4">
                <div className="flex items-center gap-3">
                  {post.flowchart.user.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.flowchart.user.avatar} alt="" className="h-11 w-11 rounded-full border border-[color:var(--color-border)] object-cover" />
                  ) : (
                    <div className="grid h-11 w-11 place-items-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-bg)] text-sm font-semibold text-[color:var(--color-text-secondary)]">
                      {authorName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">{authorName}</p>
                    <p className="text-xs text-[color:var(--color-text-secondary)]">{authorUsername}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-[color:var(--color-border)]">
              <FlowchartPreview snapshot={post.flowchart.shapes} />
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <h2 className="text-lg font-semibold text-[color:var(--color-text-primary)]">Problem description</h2>
                <p className="mt-3 leading-7 text-[color:var(--color-text-secondary)]">{post.flowchart.problem || "No written prompt was attached to this canvas."}</p>
              </div>
              <div className="code-surface rounded-2xl border border-[color:var(--color-dark-border)] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-white">Code solution</h2>
                  <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-white/70">{post.flowchart.language || "python"}</span>
                </div>
                <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap font-mono text-[13px] leading-7 text-white/85">
                  {post.flowchart.generatedCode || "// No generated code was saved with this post."}
                </pre>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
              <h2 className="text-lg font-semibold text-[color:var(--color-text-primary)]">Thread stats</h2>
              <div className="mt-4 grid gap-3 text-sm text-[color:var(--color-text-secondary)]">
                <div className="flex items-center justify-between rounded-xl border border-[color:var(--color-border)] px-4 py-3">
                  <span className="inline-flex items-center gap-2"><Eye className="h-4 w-4 text-[color:var(--color-accent)]" strokeWidth={1.5} />Views</span>
                  <span className="font-semibold text-[color:var(--color-text-primary)]">{post.views}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-[color:var(--color-border)] px-4 py-3">
                  <span className="inline-flex items-center gap-2"><ThumbsUp className="h-4 w-4 text-[color:var(--color-accent)]" strokeWidth={1.5} />Upvotes</span>
                  <span className="font-semibold text-[color:var(--color-text-primary)]">{post.upvotes}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-[color:var(--color-border)] px-4 py-3">
                  <span className="inline-flex items-center gap-2"><Bookmark className="h-4 w-4 text-[color:var(--color-accent)]" strokeWidth={1.5} />Saves</span>
                  <span className="font-semibold text-[color:var(--color-text-primary)]">{post.saves.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-[color:var(--color-border)] px-4 py-3">
                  <span className="inline-flex items-center gap-2"><MessageSquare className="h-4 w-4 text-[color:var(--color-accent)]" strokeWidth={1.5} />Comments</span>
                  <span className="font-semibold text-[color:var(--color-text-primary)]">{comments.length}</span>
                </div>
              </div>
            </div>

            <CommunityActions
              postId={post.id}
              initialSaved={isSaved}
              initialUpvotes={post.upvotes}
              commentCount={comments.length}
            />
            <RemixButton flowchartId={post.flowchart.id} canResumeSession={canResumeSession} />
            <Link
              href="/canvas/new"
              className="block rounded-full border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] px-4 py-3 text-center text-sm font-semibold text-[color:var(--text-primary)] transition duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--surface-hover)]"
            >
              Start a fresh workspace
            </Link>
          </aside>
        </div>

        <CommentsPanel
          postId={post.id}
          initialComments={comments.map((comment) => ({
            id: comment.id,
            body: comment.body,
            createdAt: comment.createdAt.toISOString(),
            user: comment.user
          }))}
        />
      </div>
    </section>
  );
}
