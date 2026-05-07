import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { CommentsPanel } from "@/components/community/CommentsPanel";
import { CommunityActions } from "@/components/community/CommunityActions";
import { FlowchartPreview } from "@/components/community/FlowchartPreview";
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

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_420px]">
        <div className="rounded-[32px] border border-white/10 bg-[rgba(7,13,24,0.84)] p-6 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Read-only canvas</p>
              <h1 className="mt-3 text-3xl font-black text-text-primary">{post.flowchart.title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-text-secondary">
                {post.flowchart.problem || "Public study session with the stored drawing and generated code attached."}
              </p>
            </div>
            <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs uppercase tracking-[0.22em] text-text-secondary">
              {post.flowchart.language}
            </span>
          </div>
          <div className="mt-6">
            <FlowchartPreview snapshot={post.flowchart.shapes} />
          </div>
        </div>
        <aside className="space-y-4">
          <div className="rounded-[28px] border border-white/10 bg-[rgba(8,15,28,0.76)] p-5 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Generated code</p>
            <pre className="mt-5 min-h-64 overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-sm leading-6 text-white/88">
              {post.flowchart.generatedCode}
            </pre>
          </div>
          <div className="rounded-[28px] border border-white/10 bg-[rgba(8,15,28,0.76)] p-5 backdrop-blur-xl">
            <h2 className="font-bold text-text-primary">At a glance</h2>
            <div className="mt-4 grid gap-3 text-sm text-text-secondary">
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                <span>Views</span>
                <span className="font-semibold text-text-primary">{post.views}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                <span>Saved by learners</span>
                <span className="font-semibold text-text-primary">{post.saves.length}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3">
                <span>Discussion replies</span>
                <span className="font-semibold text-text-primary">{comments.length}</span>
              </div>
            </div>
          </div>
          <CommunityActions
            postId={post.id}
            initialSaved={isSaved}
            initialUpvotes={post.upvotes}
            commentCount={comments.length}
          />
          <Link
            href={canResumeSession ? `/canvas/${post.flowchart.id}` : "/canvas/new"}
            className="inline-flex w-full items-center justify-center gap-2 rounded-btn border border-accent/30 bg-accent/10 px-4 py-3 text-sm font-semibold text-text-primary transition hover:border-accent/55 hover:bg-accent/15"
          >
            {canResumeSession ? "Resume this session" : "Start a similar session"}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/canvas/new" className="block rounded-btn bg-primary px-4 py-3 text-center text-sm font-bold text-white">
            Start a fresh problem
          </Link>
        </aside>
      </div>
      <div className="mt-6">
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
