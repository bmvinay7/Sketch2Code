import { FlowchartCard } from "@/components/community/FlowchartCard";
import { LibraryFilters } from "@/components/community/LibraryFilters";
import { listCommentCounts } from "@/lib/community-comments";
import { normalizeCanvasSnapshot } from "@/lib/flowcharts";
import { prisma } from "@/lib/prisma";

export default async function CommunityPage({
  searchParams
}: {
  searchParams?: { q?: string; language?: string; sort?: string };
}) {
  const q = searchParams?.q?.trim();
  const language = searchParams?.language?.trim() || "All";
  const sort = searchParams?.sort?.trim() || "Newest";

  const posts = await prisma.communityPost.findMany({
    where: {
      flowchart: {
        language: language !== "All" ? language.toLowerCase() : undefined,
        OR: q
          ? [
              { title: { contains: q, mode: "insensitive" } },
              { problem: { contains: q, mode: "insensitive" } }
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
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(14,29,50,0.96),rgba(8,12,22,0.86))] px-6 py-8 shadow-[0_24px_80px_rgba(0,0,0,0.25)] sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Community Library</p>
        <h1 className="mt-3 max-w-2xl text-3xl font-black text-text-primary sm:text-4xl">Flowcharts worth studying, critiquing, and remixing</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-text-secondary">
          Browse public problem-solving sessions with the original drawing, generated code, and discussion attached to each post.
        </p>
      </div>
      <LibraryFilters initialLanguage={language} initialQuery={q ?? ""} initialSort={sort} />
      {posts.length > 0 ? (
        <div className="mt-8 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {posts.map((post) => (
            <div key={post.id} className="mb-4 break-inside-avoid">
              <FlowchartCard
                item={{
                  id: post.id,
                  title: post.flowchart.title,
                  problem: post.flowchart.problem,
                  language: post.flowchart.language,
                  shapeCount: normalizeCanvasSnapshot(post.flowchart.shapes).shapes.length,
                  upvotes: post.upvotes,
                  saves: post.saves.length,
                  comments: commentCounts.get(post.id) ?? 0,
                  authorName: post.flowchart.user.name,
                  isVerified: post.isVerified
                }}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-lg border border-dashed border-border p-10 text-center text-text-secondary">
          No published flowcharts match these filters yet.
        </div>
      )}
    </section>
  );
}
