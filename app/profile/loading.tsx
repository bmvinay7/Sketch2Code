import { Skeleton } from "@/components/ui/Skeleton";

export default function ProfileLoading() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <Skeleton className="h-10 w-80" />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-60" />
        <Skeleton className="h-60" />
      </div>
    </section>
  );
}
