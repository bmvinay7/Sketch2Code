import Link from "next/link";
import { Bookmark, ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function CommunityPostPage({ params }: { params: { postId: string } }) {
  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_420px]">
      <div className="min-h-[520px] rounded-lg border border-border bg-[#08080d] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Read-only canvas</p>
        <div className="mt-6 grid h-[430px] place-items-center rounded-lg border border-dashed border-border text-text-secondary">
          Flowchart preview for {params.postId}
        </div>
      </div>
      <aside className="space-y-4">
        <div className="rounded-lg border border-border bg-surface p-5">
          <h1 className="text-2xl font-black text-text-primary">Community flowchart</h1>
          <pre className="mt-5 min-h-64 whitespace-pre-wrap rounded-lg bg-background p-4 font-mono text-sm text-text-secondary">
            def solve():
                # generated code appears here
                return None
          </pre>
        </div>
        <div className="rounded-lg border border-border bg-surface p-5">
          <h2 className="font-bold text-accent">What the algorithm does</h2>
          <p className="mt-2 text-sm leading-6 text-text-secondary">This public post view is ready to connect to saved Prisma flowcharts.</p>
        </div>
        <div className="flex gap-3">
          <Button className="flex-1">
            <Bookmark className="mr-2 inline h-4 w-4" />
            Save
          </Button>
          <Button className="flex-1">
            <ThumbsUp className="mr-2 inline h-4 w-4" />
            Upvote
          </Button>
        </div>
        <Link href="/canvas/new" className="block rounded-lg bg-primary px-4 py-3 text-center text-sm font-bold text-white">
          Try this problem
        </Link>
      </aside>
    </section>
  );
}
