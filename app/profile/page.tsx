import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { requireDatabaseUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

export default async function ProfilePage() {
  const clerkUser = await currentUser();
  if (!clerkUser) notFound();

  const appUser = await requireDatabaseUser(clerkUser.id);
  if (!appUser) notFound();

  const profile = await prisma.user.findUnique({
    where: { id: appUser.id },
    include: {
      flowcharts: {
        include: { communityPost: true },
        orderBy: { updatedAt: "desc" },
        take: 24
      }
    }
  });

  if (!profile) notFound();

  const published = profile.flowcharts.filter((flowchart) => flowchart.communityPost);

  return (
    <section className="px-[clamp(24px,5vw,60px)] py-8">
      <div className="mx-auto max-w-[1100px] space-y-5">
        <div className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
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
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.06em] text-[color:var(--color-accent)]">Your profile</p>
                <h1 className="mt-2 font-display text-[clamp(2.2rem,5vw,3.4rem)] font-bold leading-[1.05] tracking-[-0.02em] text-[color:var(--color-text-primary)]">
                  {profile.name}
                </h1>
                <p className="mt-2 text-[color:var(--color-text-secondary)]">{profile.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-[color:var(--color-border)] px-4 py-3">
                <p className="font-mono text-xs uppercase tracking-[0.06em] text-[color:var(--color-text-secondary)]">Saved</p>
                <p className="mt-1 text-2xl font-semibold">{profile.flowcharts.length}</p>
              </div>
              <div className="rounded-xl border border-[color:var(--color-border)] px-4 py-3">
                <p className="font-mono text-xs uppercase tracking-[0.06em] text-[color:var(--color-text-secondary)]">Posts</p>
                <p className="mt-1 text-2xl font-semibold">{published.length}</p>
              </div>
              <div className="rounded-xl border border-[color:var(--color-border)] px-4 py-3">
                <p className="font-mono text-xs uppercase tracking-[0.06em] text-[color:var(--color-text-secondary)]">Activity</p>
                <p className="mt-1 text-2xl font-semibold">{profile.flowcharts.length + published.length}</p>
              </div>
            </div>
          </div>
        </div>

        <ProfileTabs
          ownProfile
          savedCanvases={profile.flowcharts.map((flowchart) => ({
            id: flowchart.id,
            title: flowchart.title,
            problem: flowchart.problem,
            language: flowchart.language,
            updatedAt: formatDate(flowchart.updatedAt),
            shapes: flowchart.shapes
          }))}
          communityPosts={published.map((flowchart) => ({
            id: flowchart.communityPost!.id,
            title: flowchart.title,
            problem: flowchart.problem,
            language: flowchart.language,
            createdAt: formatDate(flowchart.communityPost!.createdAt),
            shapes: flowchart.shapes,
            canDelete: true
          }))}
          activity={[
            `${profile.flowcharts.length} saved canvases in your library`,
            `${published.length} public community posts`,
            "Private drafts stay hidden until you publish them"
          ]}
        />
      </div>
    </section>
  );
}
