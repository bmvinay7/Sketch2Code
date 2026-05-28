import Link from "next/link";
import { Prisma } from "@prisma/client";
import { ArrowUpRight } from "lucide-react";
import { FlowchartCard, type FlowchartCardData } from "@/components/community/FlowchartCard";
import { LibraryFilters } from "@/components/community/LibraryFilters";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type SearchParams = {
  q?: string;
  language?: string;
  sort?: string;
};

type SortKey = "newest" | "upvotes" | "saves";

const SORT_OPTIONS: Record<SortKey, Prisma.CommunityPostOrderByWithRelationInput> = {
  newest: { createdAt: "desc" },
  upvotes: { upvotes: "desc" },
  saves: { saves: { _count: "desc" } }
};

function normaliseSort(value: string | undefined): SortKey {
  if (value === "upvotes" || value === "saves") return value;
  return "newest";
}

function normaliseLanguage(value: string | undefined): string | undefined {
  if (!value || value.toLowerCase() === "all") return undefined;
  return value.toLowerCase();
}

async function fetchPosts(params: SearchParams): Promise<{ cards: FlowchartCardData[]; offline: boolean }> {
  const language = normaliseLanguage(params.language);
  const sort = normaliseSort(params.sort);
  const q = params.q?.trim();

  try {
    const posts = await prisma.communityPost.findMany({
      where: {
        flowchart: {
          isPublished: true,
          language,
          OR: q
            ? [
                { title: { contains: q, mode: "insensitive" } },
                { problem: { contains: q, mode: "insensitive" } }
              ]
            : undefined
        }
      },
      include: { flowchart: { include: { user: true } } },
      orderBy: SORT_OPTIONS[sort],
      take: 48
    });
    const cards: FlowchartCardData[] = posts.map((post) => ({
      id: post.id,
      problem: post.flowchart.title,
      language: post.flowchart.language,
      lineCount: post.flowchart.generatedCode ? post.flowchart.generatedCode.split("\n").length : 0,
      upvotes: post.upvotes,
      authorName: post.flowchart.user?.name ?? "Anonymous",
      authorAvatar: post.flowchart.user?.avatar ?? undefined,
      tags: post.tags,
      isVerified: post.isVerified
    }));
    return { cards, offline: false };
  } catch (error) {
    console.error("[community] prisma fetch failed:", error);
    return { cards: [], offline: true };
  }
}

export default async function CommunityPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { cards, offline } = await fetchPosts(params);

  return (
    <section className="mx-auto max-w-[1480px] px-6 pb-24 pt-12 lg:px-10">
      {/* Title block */}
      <header className="grid items-end gap-8 border-b border-rule pb-10 md:grid-cols-[1fr_auto]">
        <div>
          <p className="eyebrow flex items-center gap-3">
            <span className="h-px w-8 bg-rule-strong" aria-hidden />
            library · vol. 01
          </p>
          <h1 className="mono-headline mt-6 text-[10vw] text-paper-50 sm:text-[64px] lg:text-[88px]">
            flowcharts <span className="serif-italic text-paper-200">worth studying.</span>
          </h1>
          <p className="mt-5 max-w-lg text-[14px] leading-relaxed text-paper-100">
            Public diagrams from other learners. Read the code, study the logic, fork the problem to your own canvas.
          </p>
        </div>
        <Link
          href="/canvas/new"
          className="group inline-flex h-12 items-center gap-3 self-end border border-rule-strong px-5 font-mono text-[12px] uppercase tracking-cap text-paper-50 transition-colors hover:bg-paper-50 hover:text-ink-0"
        >
          publish your own
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </header>

      {/* Filters */}
      <div className="mt-10">
        <LibraryFilters
          defaultQuery={params.q ?? ""}
          defaultLanguage={params.language ?? "All"}
          defaultSort={normaliseSort(params.sort)}
        />
      </div>

      {/* Status line */}
      <div className="mt-6 flex items-center justify-between font-mono text-[11px] uppercase tracking-cap text-paper-300">
        <span>
          showing <span className="tabular text-paper-50">{cards.length.toString().padStart(2, "0")}</span> of <span className="tabular text-paper-50">{cards.length.toString().padStart(2, "0")}</span>
        </span>
        <span>
          sorted by{" "}
          <span className="text-paper-50">{normaliseSort(params.sort)}</span>
        </span>
      </div>

      {/* Body */}
      {offline ? (
        <div className="mt-10 border border-rule bg-ink-50 px-8 py-12 text-center">
          <p className="eyebrow text-amber">database offline</p>
          <h2 className="mono-headline mt-5 text-[32px] text-paper-50">
            the library is <span className="serif-italic">resting.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[13px] leading-relaxed text-paper-100">
            Postgres isn&apos;t reachable. Start it locally and reload — published flowcharts will reappear.
          </p>
        </div>
      ) : cards.length > 0 ? (
        <div className="mt-8 grid gap-px bg-rule md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card, i) => (
            <FlowchartCard key={card.id} item={card} index={i + 1} total={cards.length} />
          ))}
        </div>
      ) : (
        <div className="mt-10 border border-dashed border-rule bg-ink-0 px-8 py-16 text-center">
          <p className="eyebrow">no entries</p>
          <h2 className="mono-headline mt-4 text-[28px] text-paper-50">
            empty <span className="serif-italic text-paper-200">shelf.</span>
          </h2>
          <p className="mx-auto mt-3 max-w-sm text-[13px] leading-relaxed text-paper-100">
            Be the first to publish. Draw something on the canvas, then hit{" "}
            <span className="font-mono text-paper-50">publish to community</span>.
          </p>
        </div>
      )}
    </section>
  );
}
