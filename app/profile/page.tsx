import { currentUser } from "@clerk/nextjs/server";
import { Skeleton } from "@/components/ui/Skeleton";

export default async function ProfilePage() {
  const user = await currentUser();

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
        {["My Flowcharts", "Saved"].map((tab) => (
          <section key={tab} className="rounded-lg border border-border bg-surface p-5">
            <h2 className="font-bold text-text-primary">{tab}</h2>
            <div className="mt-5 rounded-lg border border-dashed border-border p-8 text-center text-sm text-text-secondary">
              No entries yet.
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
