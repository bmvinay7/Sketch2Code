import { FlowchartCard } from "@/components/community/FlowchartCard";
import { LibraryFilters } from "@/components/community/LibraryFilters";
import { buildCommunityUsername, buildDisplayHandle } from "@/lib/community";
import { listCommentCounts } from "@/lib/community-comments";
import { normalizeCanvasSnapshot } from "@/lib/flowcharts";
import { prisma } from "@/lib/prisma";

export default async function CommunityPage({
  searchParams
}: {
  searchParams: { q?: string; sort?: string };
}) {
  const q = searchParams.q || "";
  const sort = searchParams.sort || "Latest";

  const posts = await prisma.communityPost.findMany({
    where: {
      flowchart: {
        OR: q
          ? [
              { title: { contains: q } },
              { problem: { contains: q } }
            ]
          : undefined
      }
    },
    include: {
      flowchart: { include: { user: true } },
      saves: true
    },
    orderBy:
      sort === "Most Upvoted"
        ? { upvotes: "desc" }
        : sort === "Most Saved"
          ? { saves: { _count: "desc" } }
          : { createdAt: "desc" },
    take: 24
  });

  const commentCounts = await listCommentCounts(posts.map((post) => post.id));

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px] space-y-4">
        <div className="panel rounded-[2rem] px-6 py-7">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">Public community archive</p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <h1 className="font-display text-[clamp(2.8rem,5vw,4.8rem)] leading-[0.96] tracking-[-0.06em] text-[color:var(--text-primary)]">
                A Reddit-style study feed for algorithm canvases.
              </h1>
              <p className="mt-4 max-w-[68ch] text-base leading-8 text-[color:var(--text-secondary)]">
                Browse published boards with the original Excalidraw canvas, generated code context, votes, saves, and practical comments. The public feed is where finished thinking patterns become reusable references.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-[color:var(--border-soft)] bg-[color:var(--surface-elevated)] px-5 py-4 text-sm text-[color:var(--text-secondary)]">
              <p className="font-semibold text-[color:var(--text-primary)]">{posts.length} live posts in this slice</p>
              <p className="mt-1">Newest first, with save/upvote sorting for denser study sessions.</p>
            </div>
          </div>
        </div>

        <LibraryFilters initialQuery={q} initialSort={sort} />

        {posts.length > 0 ? (
          <div className="grid gap-4">
            {posts.map((post) => {
              const authorName = buildDisplayHandle(post.flowchart.user.name, post.flowchart.user.email);
              return (
                <FlowchartCard
                  key={post.id}
                  item={{
                    id: post.id,
                    title: post.flowchart.title,
                    problem: post.flowchart.problem,
                    shapeCount: normalizeCanvasSnapshot(post.flowchart.shapes).shapes.length,
                    upvotes: post.upvotes,
                    saves: post.saves.length,
                    comments: commentCounts.get(post.id) ?? 0,
                    views: post.views,
                    authorName,
                    authorUsername: buildCommunityUsername(post.flowchart.user.name, post.flowchart.user.email),
                    authorAvatar: post.flowchart.user.avatar,
                    isVerified: post.isVerified,
                    createdAt: new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(post.createdAt),
                    snapshot: post.flowchart.shapes
                  }}
                />
              );
            })}
          </div>
        ) : (
          <div className="panel rounded-[1.8rem] p-10 text-center text-sm text-[color:var(--text-secondary)]">
            No published flowcharts match these filters yet.
          </div>
        )}
      </div>
    </section>
  );
}
