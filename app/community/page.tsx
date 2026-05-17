import { FlowchartCard } from "@/components/community/FlowchartCard";
import { LibraryFilters } from "@/components/community/LibraryFilters";
import { buildCommunityUsername, buildDisplayHandle } from "@/lib/community";
import { listCommentCounts } from "@/lib/community-comments";
import { normalizeCanvasSnapshot } from "@/lib/flowcharts";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

function parseTags(value: unknown) {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

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

  const contributors = posts
    .map((post) => post.flowchart.user)
    .filter((user, index, users) => users.findIndex((entry) => entry.id === user.id) === index)
    .slice(0, 5);
  const trendingTags = Array.from(new Set(posts.flatMap((post) => parseTags(post.tags)))).slice(0, 8);

  return (
    <section className="px-[clamp(24px,5vw,60px)] py-8">
      <div className="mx-auto max-w-[1100px] space-y-5">
        <div className="border-b border-[color:var(--color-border)] pb-6">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.06em] text-[color:var(--color-accent)]">Public community archive</p>
          <h1 className="mt-3 max-w-[760px] font-display text-[clamp(2.4rem,6vw,4rem)] font-bold leading-[1.05] tracking-[-0.02em] text-[color:var(--color-text-primary)]">
            Study real algorithm boards, then remix the ones that click.
          </h1>
          <p className="mt-4 max-w-[65ch] leading-8 text-[color:var(--color-text-secondary)]">
            Published canvases keep the diagram, generated code, votes, saves, and comments together.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.65fr)_minmax(280px,0.35fr)]">
          <main className="space-y-4">
            <LibraryFilters initialQuery={q} initialSort={sort} />
            {posts.length > 0 ? (
              <div className="grid gap-4">
            {posts.map((post) => {
              const authorName = buildDisplayHandle(post.flowchart.user.name, post.flowchart.user.email);
              const snapshot = normalizeCanvasSnapshot(post.flowchart.shapes);
              return (
                <FlowchartCard
                  key={post.id}
                  item={{
                    id: post.id,
                    title: post.flowchart.title,
                    problem: post.flowchart.problem,
                    shapeCount: snapshot.sceneElements.length || snapshot.shapes.length,
                    upvotes: post.upvotes,
                    saves: post.saves.length,
                    comments: commentCounts.get(post.id) ?? 0,
                    views: post.views,
                    authorName,
                    authorUsername: buildCommunityUsername(post.flowchart.user.name, post.flowchart.user.email),
                    authorAvatar: post.flowchart.user.avatar,
                    isVerified: post.isVerified,
                    createdAt: new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(post.createdAt),
                    snapshot: post.flowchart.shapes,
                    tags: parseTags(post.tags)
                  }}
                />
              );
            })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-10 text-center text-sm text-[color:var(--color-text-secondary)]">
                No published flowcharts match these filters yet.
              </div>
            )}
          </main>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
              <h2 className="text-lg font-semibold text-[color:var(--color-text-primary)]">Top contributors</h2>
              <div className="mt-4 space-y-3">
                {contributors.map((user) => (
                  <div key={user.id} className="flex items-center gap-3">
                    {user.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatar} alt="" className="h-9 w-9 rounded-full border border-[color:var(--color-border)] object-cover" />
                    ) : (
                      <div className="grid h-9 w-9 place-items-center rounded-full border border-[color:var(--color-border)] text-sm font-semibold text-[color:var(--color-text-secondary)]">
                        {buildDisplayHandle(user.name, user.email).slice(0, 1)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">{buildDisplayHandle(user.name, user.email)}</p>
                      <p className="text-xs text-[color:var(--color-text-secondary)]">{buildCommunityUsername(user.name, user.email)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
              <h2 className="text-lg font-semibold text-[color:var(--color-text-primary)]">Trending tags</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {(trendingTags.length ? trendingTags : ["algorithm", "graph", "array", "tree"]).map((tag) => (
                  <span key={tag} className="rounded-full border border-[color:var(--color-border)] px-3 py-1.5 font-mono text-xs text-[color:var(--color-text-secondary)]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <Link href="/canvas/new" className="block rounded-2xl border border-[color:var(--color-dark-surface)] bg-[color:var(--color-dark-surface)] p-5 text-[color:var(--color-text-on-dark)] hover:-translate-y-px">
              <p className="font-semibold">Post a solved canvas</p>
              <p className="mt-2 text-sm opacity-75">Generate code, publish, then discuss the exact diagram.</p>
            </Link>
          </aside>
        </div>
      </div>
    </section>
  );
}
