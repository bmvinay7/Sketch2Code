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
    <section className="px-3 py-4 sm:px-5">
      <div className="mx-auto max-w-[1540px] space-y-3">
        <div className="border-b border-[color:var(--border)] px-1 pb-4">
          <p className="text-xs font-semibold uppercase text-[color:var(--accent)]">Community artifacts</p>
          <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <h1 className="text-4xl font-extrabold leading-tight text-[color:var(--text-primary)] max-sm:text-3xl">
                Algorithm workspaces people can study, fork, and critique.
              </h1>
              <p className="mt-2 max-w-[68ch] text-sm leading-6 text-[color:var(--text-secondary)]">
                Published boards include the drawing, code context, discussion, and remix trail.
              </p>
            </div>
            <div className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-elevated)] px-4 py-3 text-sm text-[color:var(--text-secondary)]">
              <p className="font-semibold text-[color:var(--text-primary)]">{posts.length} live posts in this slice</p>
              <p className="mt-1">Sort by recency, saves, or votes.</p>
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
          <div className="panel p-10 text-center text-sm text-[color:var(--text-secondary)]">
            No published flowcharts match these filters yet.
          </div>
        )}
      </div>
    </section>
  );
}
