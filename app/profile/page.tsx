import Link from "next/link";
import { Bookmark, Globe2, Layers3, Library, Share2 } from "lucide-react";
import { currentUser } from "@clerk/nextjs/server";
import { FlowchartPreview } from "@/components/community/FlowchartPreview";
import { requireDatabaseUser } from "@/lib/auth-user";
import { buildCommunityUsername, buildDisplayHandle } from "@/lib/community";
import { prisma } from "@/lib/prisma";

export default async function ProfilePage() {
  const user = await currentUser();
  const appUser = user ? await requireDatabaseUser(user.id) : null;
  const profile = appUser
    ? await prisma.user.findUnique({
        where: { id: appUser.id },
        include: {
          flowcharts: {
            include: { communityPost: true },
            orderBy: { updatedAt: "desc" },
            take: 6
          },
          saves: {
            include: {
              post: {
                include: { flowchart: { include: { user: true } } }
              }
            },
            orderBy: { savedAt: "desc" },
            take: 6
          }
        }
      })
    : null;

  const publicPosts = await prisma.communityPost.findMany({
    include: { flowchart: { include: { user: true } }, saves: true },
    orderBy: { createdAt: "desc" },
    take: 8
  });

  const publishedPosts = profile?.flowcharts.filter((flowchart) => flowchart.communityPost) ?? [];

  return (
    <section className="px-3 py-4 sm:px-5">
      <div className="mx-auto max-w-[1540px] space-y-3">
        <div className="border-b border-[color:var(--border)] px-1 pb-4">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="" className="h-20 w-20 rounded-full border border-[color:var(--border-soft)] object-cover" />
              ) : (
                <div className="grid h-20 w-20 place-items-center rounded-full border border-[color:var(--border-soft)] bg-[color:var(--surface-elevated)] text-xl font-semibold text-[color:var(--text-secondary)]">
                  {(user?.fullName || "Y").slice(0, 1).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--accent)]">Your library</p>
                <h1 className="mt-2 text-4xl font-extrabold leading-tight text-[color:var(--text-primary)] max-sm:text-3xl">
                  {user?.fullName ?? "Workspace profile"}
                </h1>
                <p className="mt-2 max-w-[66ch] text-sm leading-6 text-[color:var(--text-secondary)]">
                  Private drafts, saved references, published workspaces, and the public feed in one place.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface-elevated)] px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Drafts</p>
                <p className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">{profile?.flowcharts.length ?? 0}</p>
              </div>
              <div className="rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface-elevated)] px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Published</p>
                <p className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">{publishedPosts.length}</p>
              </div>
              <div className="rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface-elevated)] px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[color:var(--text-muted)]">Saved</p>
                <p className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">{profile?.saves.length ?? 0}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <section className="panel p-4 xl:col-span-2">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--accent-soft)] text-[color:var(--accent)]">
                <Library className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[color:var(--text-primary)]">My workspaces</h2>
                <p className="text-sm text-[color:var(--text-secondary)]">Private drafts and active learning sessions.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {profile?.flowcharts.length ? (
                profile.flowcharts.map((flowchart) => (
                  <Link key={flowchart.id} href={`/canvas/${flowchart.id}`} className="rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface-elevated)] p-4 transition duration-200 hover:-translate-y-0.5">
                    <p className="text-lg font-semibold text-[color:var(--text-primary)]">{flowchart.title}</p>
                    <p className="mt-2 text-sm leading-7 text-[color:var(--text-secondary)]">{flowchart.problem || "Saved session"}</p>
                    <div className="mt-4 overflow-hidden rounded-lg border border-[color:var(--border-soft)]">
                      <FlowchartPreview snapshot={flowchart.shapes} title={flowchart.title} heightClass="h-[220px]" />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-[color:var(--border-strong)] p-8 text-center text-sm text-[color:var(--text-secondary)]">
                  No workspaces saved yet.
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="panel p-4">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--accent-soft)] text-[color:var(--accent)]">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[color:var(--text-primary)]">Published by you</h2>
                  <p className="text-sm text-[color:var(--text-secondary)]">Anything you pushed to the public feed.</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {publishedPosts.length ? (
                  publishedPosts.map((flowchart) => (
                    <Link key={flowchart.id} href={`/community/${flowchart.communityPost?.id}`} className="block rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface-elevated)] p-4 transition duration-200 hover:-translate-y-0.5">
                      <p className="font-semibold text-[color:var(--text-primary)]">{flowchart.title}</p>
                      <p className="mt-2 text-sm text-[color:var(--text-secondary)]">{flowchart.problem || "Published flowchart"}</p>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-[color:var(--border-strong)] p-5 text-sm text-[color:var(--text-secondary)]">
                    Nothing published yet.
                  </div>
                )}
              </div>
            </div>

            <div className="panel p-4">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--accent-soft)] text-[color:var(--accent)]">
                  <Bookmark className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[color:var(--text-primary)]">Saved from community</h2>
                  <p className="text-sm text-[color:var(--text-secondary)]">References you bookmarked.</p>
                </div>
              </div>
              <div className="mt-5 space-y-3">
                {profile?.saves.length ? (
                  profile.saves.map((save) => (
                    <Link key={save.id} href={`/community/${save.postId}`} className="block rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface-elevated)] p-4 transition duration-200 hover:-translate-y-0.5">
                      <p className="font-semibold text-[color:var(--text-primary)]">{save.post.flowchart.title}</p>
                      <p className="mt-2 text-sm text-[color:var(--text-secondary)]">
                        {buildDisplayHandle(save.post.flowchart.user.name, save.post.flowchart.user.email)} · {buildCommunityUsername(save.post.flowchart.user.name, save.post.flowchart.user.email)}
                      </p>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-[color:var(--border-strong)] p-5 text-sm text-[color:var(--text-secondary)]">
                    Nothing saved yet.
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        <section className="panel p-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[color:var(--accent-soft)] text-[color:var(--accent)]">
              <Globe2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[color:var(--text-primary)]">Public community feed</h2>
              <p className="text-sm text-[color:var(--text-secondary)]">Visible here for every user because this archive is public space.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {publicPosts.map((post) => (
              <Link key={post.id} href={`/community/${post.id}`} className="rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--surface-elevated)] p-4 transition duration-200 hover:-translate-y-0.5">
                <div className="flex items-center gap-2 text-xs text-[color:var(--text-muted)]">
                  <Layers3 className="h-3.5 w-3.5" />
                  {buildDisplayHandle(post.flowchart.user.name, post.flowchart.user.email)}
                </div>
                <p className="mt-3 text-lg font-semibold text-[color:var(--text-primary)]">{post.flowchart.title}</p>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[color:var(--text-secondary)]">{post.flowchart.problem || "Public flowchart"}</p>
                <div className="mt-4 overflow-hidden rounded-lg border border-[color:var(--border-soft)]">
                  <FlowchartPreview snapshot={post.flowchart.shapes} title={post.flowchart.title} heightClass="h-[220px]" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
