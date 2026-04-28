import Link from "next/link";
import { ArrowRight, GitBranch, Library, Radar } from "lucide-react";
import { MockCodeStream } from "@/components/code/MockCodeStream";

const features = [
  {
    icon: Radar,
    title: "Live Streaming Canvas",
    body: "Each completed flowchart node streams faithful code fragments without waiting for the whole diagram."
  },
  {
    icon: GitBranch,
    title: "Trace Mode",
    body: "Replay execution step by step and watch the active flowchart node pulse with runtime state."
  },
  {
    icon: Library,
    title: "Community Library",
    body: "Browse, save, and remix flowcharts from other learners once your solution is ready."
  }
];

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      <section className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_0.86fr]">
        <div className="relative z-10">
          <p className="mb-5 inline-flex rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-accent">
            Sketch2Code
          </p>
          <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight sm:text-7xl">
            <span className="gradient-text">Draw your algorithm.</span>
            <br />
            Watch it become code.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-text-secondary">
            Place flowchart shapes, stream code in real time, then analyze exactly where your logic works or breaks.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/canvas/new"
              className="gradient-button inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-indigo transition hover:scale-[1.02] hover:shadow-glow"
            >
              Try it now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/community" className="text-sm font-semibold text-text-secondary hover:text-text-primary">
              Explore community
            </Link>
          </div>
        </div>
        <MockCodeStream />
      </section>
      <section className="mx-auto grid max-w-7xl gap-4 px-4 pb-20 sm:px-6 md:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="group rounded-lg border border-border bg-surface/70 p-5 transition hover:-translate-y-1 hover:border-accent/60 hover:shadow-glow"
          >
            <feature.icon className="h-6 w-6 text-accent" />
            <h2 className="mt-5 text-lg font-bold text-text-primary">{feature.title}</h2>
            <p className="mt-3 text-sm leading-6 text-text-secondary">{feature.body}</p>
          </article>
        ))}
      </section>
      <footer className="border-t border-border py-8 text-center text-sm text-text-muted">
        Built for DSA practice where the diagram is the source of truth.
      </footer>
    </div>
  );
}
