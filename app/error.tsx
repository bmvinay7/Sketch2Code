"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <section className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center px-6 text-center">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Something broke in this view.</h1>
        <p className="mt-3 text-text-secondary">The workspace recovered without losing your browser session.</p>
        <button className="mt-6 rounded-lg bg-primary px-4 py-2 text-sm font-semibold" onClick={reset}>
          Retry
        </button>
      </div>
    </section>
  );
}
