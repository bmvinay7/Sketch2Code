"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <section className="mx-auto grid min-h-[60vh] max-w-3xl place-items-center px-6 text-center">
      <div>
        <p className="eyebrow text-amber">error</p>
        <h1 className="mono-headline mt-5 text-[48px] text-paper-50">
          something <span className="serif-italic">broke.</span>
        </h1>
        <p className="mt-4 text-[13px] leading-relaxed text-paper-100">
          The workspace recovered without losing your browser session.
        </p>
        <button
          className="mt-8 inline-flex h-11 items-center border border-rule-strong px-5 font-mono text-[12px] uppercase tracking-cap text-paper-50 transition-colors hover:bg-paper-50 hover:text-ink-0"
          onClick={reset}
        >
          retry →
        </button>
      </div>
    </section>
  );
}
