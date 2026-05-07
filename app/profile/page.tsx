import Link from "next/link";
import { currentUser } from "@clerk/nextjs/server";
import { Skeleton } from "@/components/ui/Skeleton";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const user = await currentUser();
  const profile = user
    ? await prisma.user.findUnique({
        where: { clerkId: user.id },
        include: {
          flowcharts: {
            orderBy: { updatedAt: "desc" },
            take: 8
          },
          saves: {
            include: {
              post: {
                include: { flowchart: true }
              }
            },
            orderBy: { savedAt: "desc" },
            take: 8
          }
        }
      })
    : null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-4 border-b border-border pb-8">
        {user?.imageUrl ? (
          <img src={user.imageUrl} alt="" className="h-16 w-16 rounded-full border border-border" />
        ) : (
          <Skeleton className="h-16 w-16 rounded-full" />
        )}
        <div>
          <h1 className="text-3xl font-black text-text-primary">{user?.fullName ?? "Your profile"}</h1>
          <p className="mt-1 text-sm text-text-secondary">Joined Sketch2Code through Clerk authentication.</p>
        </div>
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-bold text-text-primary">My Flowcharts</h2>
          <div className="mt-5 space-y-3">
            {profile?.flowcharts.length ? (
              profile.flowcharts.map((flowchart) => (
                <Link key={flowchart.id} href={`/canvas/${flowchart.id}`} className="block rounded-xl border border-white/8 bg-black/20 p-4 transition hover:border-accent/40">
                  <p className="font-semibold text-text-primary">{flowchart.title}</p>
                  <p className="mt-1 text-sm text-text-secondary">{flowchart.problem || "Saved session"}</p>
                </Link>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-text-secondary">
                No flowcharts saved yet.
              </div>
            )}
          </div>
        </section>
        <section className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-bold text-text-primary">Saved</h2>
          <div className="mt-5 space-y-3">
            {profile?.saves.length ? (
              profile.saves.map((save) => (
                <Link key={save.id} href={`/community/${save.postId}`} className="block rounded-xl border border-white/8 bg-black/20 p-4 transition hover:border-accent/40">
                  <p className="font-semibold text-text-primary">{save.post.flowchart.title}</p>
                  <p className="mt-1 text-sm text-text-secondary">{save.post.flowchart.problem || "Saved community post"}</p>
                </Link>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-text-secondary">
                No saved community posts yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </section>
  );
}
