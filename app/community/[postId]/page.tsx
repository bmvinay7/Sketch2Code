import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function loadPost(id: string) {
  try {
    return await prisma.communityPost.findUnique({
      where: { id },
      include: { flowchart: { include: { user: true } } }
    });
  } catch (error) {
    console.error("[community/post] prisma fetch failed:", error);
    return null;
  }
}

function formatDate(d: Date | string) {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt
    .toISOString()
    .slice(0, 10);
}

export default async function CommunityPostPage({ params }: { params: { postId: string } }) {
  const post = await loadPost(params.postId);
  if (!post) notFound();

  const { flowchart } = post;
  const code = flowchart.generatedCode || "// no code stored for this flowchart.";
  const lines = code.split("\n");

  return (
    <article className="mx-auto max-w-[1480px] px-6 pb-24 pt-12 lg:px-10">
      {/* Breadcrumb */}
      <Link
        href="/community"
        className="link-underline inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-cap text-paper-200 hover:text-paper-50"
      >
        <ArrowLeft className="h-3 w-3" />
        back to library
      </Link>

      {/* Title slab — generous top padding so the navbar can never clip it */}
      <header className="mt-10 border-b border-rule pb-12">
        <div className="flex items-center gap-3">
          <span className="index-tag">entry · {post.id.slice(-6)}</span>
          {post.isVerified && (
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-cap text-lime">
              <CheckCircle2 className="h-3 w-3" />
              verified
            </span>
          )}
        </div>
        <h1 className="mono-headline mt-5 break-words text-[10vw] text-paper-50 sm:text-[64px] lg:text-[88px]">
          {flowchart.title.toLowerCase()}
        </h1>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-cap text-paper-200">
          <span>
            <span className="text-paper-300">by </span>
            <span className="text-paper-50">{flowchart.user?.name ?? "anonymous"}</span>
          </span>
          <span>
            <span className="text-paper-300">lang </span>
            <span className="text-paper-50">{flowchart.language}</span>
          </span>
          <span>
            <span className="text-paper-300">posted </span>
            <span className="tabular text-paper-50">{formatDate(post.createdAt)}</span>
          </span>
          <span>
            <span className="text-paper-300">lines </span>
            <span className="tabular text-paper-50">{lines.length}</span>
          </span>
        </div>
      </header>

      {/* Body grid */}
      <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_320px]">
        {/* Code column */}
        <section>
          <header className="flex items-center justify-between border border-rule bg-ink-50 px-4 py-2.5">
            <span className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-cap text-paper-200">
              <span className="text-paper-300">file</span>
              <span className="text-paper-50">solution.{flowchart.language === "cpp" ? "cpp" : flowchart.language === "java" ? "java" : "py"}</span>
            </span>
            <span className="font-mono text-[10px] uppercase tracking-cap text-paper-300">
              read only
            </span>
          </header>
          <pre className="crosshair relative max-h-[640px] overflow-auto border-x border-b border-rule bg-ink-50 px-4 py-5 font-mono text-[13px] leading-[1.8]">
            {lines.map((line, i) => (
              <div key={i} className="flex gap-5">
                <span className="tabular w-8 shrink-0 select-none text-right text-paper-300">
                  {i + 1}
                </span>
                <span className="text-paper-50 whitespace-pre">{line || " "}</span>
              </div>
            ))}
          </pre>
        </section>

        {/* Side rail */}
        <aside className="space-y-px bg-rule">
          {flowchart.problem && (
            <section className="bg-ink-0 p-6">
              <p className="eyebrow">problem</p>
              <p className="mt-4 text-[14px] leading-relaxed text-paper-100">{flowchart.problem}</p>
            </section>
          )}

          {post.tags.length > 0 && (
            <section className="bg-ink-0 p-6">
              <p className="eyebrow">tags</p>
              <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-cap text-paper-200">
                {post.tags.map((tag) => (
                  <span key={tag} className="before:mr-1 before:text-paper-300 before:content-['#']">
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="bg-ink-0 p-6">
            <p className="eyebrow">stats</p>
            <div className="mt-4 grid grid-cols-2 gap-px bg-rule">
              <div className="bg-ink-0 p-4">
                <div className="eyebrow text-paper-300">upvotes</div>
                <div className="mt-2 font-mono text-[28px] font-bold tabular text-paper-50">
                  {post.upvotes}
                </div>
              </div>
              <div className="bg-ink-0 p-4">
                <div className="eyebrow text-paper-300">views</div>
                <div className="mt-2 font-mono text-[28px] font-bold tabular text-paper-50">
                  {post.views}
                </div>
              </div>
            </div>
          </section>

          <Link
            href="/canvas/new"
            className="group inline-flex w-full items-center justify-between border border-lime bg-lime px-5 py-4 font-mono text-[12px] uppercase tracking-cap text-ink-0 transition-colors hover:bg-paper-50 hover:border-paper-50"
          >
            <span>try this problem</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </aside>
      </div>
    </article>
  );
}
