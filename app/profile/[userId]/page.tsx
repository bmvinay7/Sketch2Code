import { notFound } from "next/navigation";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export default async function PublicProfilePage({ params }: { params: { userId: string } }) {
  const profile = await prisma.user.findUnique({
    where: { id: params.userId },
    include: {
      flowcharts: {
        where: { isPublished: true },
        include: { communityPost: true },
        orderBy: { updatedAt: "desc" },
        take: 24
      }
    }
  });

  if (!profile) notFound();

  const posts = profile.flowcharts.filter((flowchart) => flowchart.communityPost);

  return (
    <section className="px-[clamp(24px,5vw,60px)] py-8">
      <div className="mx-auto max-w-[1100px] space-y-5">
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
          <div className="flex items-center gap-4">
            {profile.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar} alt="" className="h-20 w-20 rounded-full border border-[color:var(--color-border)] object-cover" />
            ) : (
              <div className="grid h-20 w-20 place-items-center rounded-full border border-[color:var(--color-border)] text-xl font-semibold text-[color:var(--color-text-secondary)]">
                {profile.name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.06em] text-[color:var(--color-accent)]">Public profile</p>
              <h1 className="mt-2 font-display text-[clamp(2.2rem,5vw,3.4rem)] font-bold leading-[1.05] tracking-[-0.02em] text-[color:var(--color-text-primary)]">
                {profile.name}
              </h1>
              <p className="mt-2 text-[color:var(--color-text-secondary)]">{posts.length} community posts</p>
            </div>
          </div>
        </div>

        <ProfileTabs
          ownProfile={false}
          savedCanvases={[]}
          communityPosts={posts.map((flowchart) => ({
            id: flowchart.communityPost!.id,
            title: flowchart.title,
            problem: flowchart.problem,
            language: flowchart.language,
            createdAt: formatDate(flowchart.communityPost!.createdAt),
            shapes: flowchart.shapes
          }))}
          activity={[
            `${posts.length} public community posts`,
            "Private canvases are not visible on public profiles"
          ]}
        />
      </div>
    </section>
  );
}
