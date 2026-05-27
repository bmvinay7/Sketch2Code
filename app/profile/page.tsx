import { currentUser } from "@clerk/nextjs/server";

async function safeCurrentUser() {
  if (process.env.DISABLE_AUTH === "true") {
    return { fullName: "Local Dev", imageUrl: undefined as string | undefined };
  }
  try {
    return await currentUser();
  } catch {
    return null;
  }
}

export default async function ProfilePage() {
  const user = await safeCurrentUser();

  return (
    <section className="mx-auto max-w-[1480px] px-6 pb-24 pt-12 lg:px-10">
      <header className="border-b border-rule pb-10">
        <p className="eyebrow flex items-center gap-3">
          <span className="h-px w-8 bg-rule-strong" aria-hidden />
          profile
        </p>
        <div className="mt-8 flex items-end gap-6">
          {user?.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.imageUrl}
              alt=""
              className="h-20 w-20 border border-rule-strong object-cover"
            />
          ) : (
            <div className="h-20 w-20 border border-rule-strong bg-ink-50" />
          )}
          <div>
            <h1 className="mono-headline text-[64px] text-paper-50">
              {(user?.fullName ?? "your profile").toLowerCase()}.
            </h1>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-cap text-paper-300">
              member · since signup
            </p>
          </div>
        </div>
      </header>

      <div className="mt-10 grid gap-px bg-rule lg:grid-cols-2">
        {[
          { label: "my flowcharts", index: "01" },
          { label: "saved", index: "02" }
        ].map((tab) => (
          <section key={tab.label} className="bg-ink-0 p-6">
            <header className="flex items-baseline justify-between border-b border-rule pb-3">
              <p className="eyebrow">{tab.label}</p>
              <span className="index-tag">{tab.index} / 02</span>
            </header>
            <div className="mt-6 border border-dashed border-rule bg-ink-50/40 px-6 py-10 text-center">
              <p className="font-mono text-[12px] uppercase tracking-cap text-paper-200">no entries</p>
              <p className="mt-3 text-[13px] leading-relaxed text-paper-300">
                Once you publish a flowchart it&apos;ll show up here.
              </p>
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
