import { Skeleton } from "@/components/ui/Skeleton";

export default function CommunityLoading() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <Skeleton className="h-10 w-72" />
      <Skeleton className="mt-8 h-14 w-full" />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Skeleton className="h-44" />
        <Skeleton className="h-56" />
        <Skeleton className="h-48" />
      </div>
    </section>
  );
}
