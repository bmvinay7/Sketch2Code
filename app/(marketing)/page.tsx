"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Braces, GitBranch, MessageSquareCode, ScanLine, Share2, Sparkles, Workflow } from "lucide-react";
import { FloatingShapes } from "@/components/ui/FloatingShapes";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const snippet = `type CanvasSignal = {
  nodes: ExcalidrawElement[];
  context?: string;
};

export async function analyse(signal: CanvasSignal) {
  const intent = await inferAlgorithm(signal);
  return streamCode({
    language: "Python",
    intent,
    preserveDiagramLogic: true
  });
}`;

const features = [
  {
    title: "Canvas parsing",
    body: "Reads labels, branches, and positions before the model writes a line.",
    metric: "18 nodes mapped",
    icon: ScanLine
  },
  {
    title: "Code streaming",
    body: "Starts from cached partial output, then refines with the full board.",
    metric: "Instant first token",
    icon: MessageSquareCode
  },
  {
    title: "Reusable work",
    body: "Saves the drawing, generated code, comments, votes, and remixes together.",
    metric: "One durable artifact",
    icon: Share2
  }
];

const tracks = ["Canvas snapshot", "Generated code", "AI critique", "Votes and comments"];

function CodeWindow() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCount((current) => (current >= snippet.length ? 0 : current + 1));
    }, 22);

    return () => window.clearInterval(timer);
  }, []);

  const visible = snippet.slice(0, count);

  return (
    <div className="overflow-hidden rounded-2xl border border-[color:var(--color-dark-border)] bg-[color:var(--color-dark-surface)] text-[color:var(--color-text-on-dark)]">
      <div className="flex h-11 items-center gap-2 border-b border-white/10 px-4">
        <span className="h-3 w-3 rounded-full bg-[color:var(--color-pop-coral)]" />
        <span className="h-3 w-3 rounded-full bg-[color:var(--color-pop-yellow)]" />
        <span className="h-3 w-3 rounded-full bg-[color:var(--color-pop-lavender)]" />
        <span className="ml-auto font-mono text-xs text-white/50">canvas-stream.ts</span>
      </div>
      <pre className="code-surface min-h-[340px] overflow-hidden p-6 font-mono text-[13px] leading-7 text-white/85">
        <code>
          {visible}
          <span className="cursor-blink ml-1 inline-block h-4 w-2 bg-[color:var(--color-accent)] align-middle" />
        </code>
      </pre>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-[clamp(24px,5vw,60px)] py-[clamp(60px,8vw,96px)]">
        <FloatingShapes />
        <div className="relative z-10 mx-auto max-w-[1100px] text-center">
          <div className="fade-up is-visible inline-flex items-center gap-2 rounded-full border border-[color:var(--color-text-primary)] px-4 py-1.5 font-mono text-xs font-medium text-[color:var(--color-text-primary)]">
            <Sparkles className="h-4 w-4 text-[color:var(--color-accent)]" strokeWidth={1.5} />
            Local-first algorithm workspace
          </div>
          <h1 className="fade-up is-visible stagger-1 mx-auto mt-8 max-w-[850px] font-display text-[clamp(3.4rem,8vw,5rem)] font-extrabold leading-[1.02] tracking-[-0.02em]">
            <span className="text-[color:var(--color-accent)]">Think clearly,</span> draw once, ship code that matches the board.
          </h1>
          <p className="fade-up is-visible stagger-2 mx-auto mt-5 max-w-[680px] text-lg leading-8 text-[color:var(--color-text-secondary)]">
            Sketch2Code turns DSA flowcharts into streamed, saved, remixable code artifacts with the original diagram still attached.
          </p>
          <div className="fade-up is-visible stagger-3 mt-8 flex justify-center">
            <Link href="/canvas/new" className="inline-flex h-12 items-center gap-2 rounded-full bg-[color:var(--color-accent)] px-7 text-sm font-semibold text-[color:var(--color-text-on-dark)] hover:-translate-y-px hover:bg-[color:var(--color-accent-hover)]">
              Try Now
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        <div className="relative z-10 mx-auto mt-12 max-w-[980px]">
          <div className="grid gap-3 md:grid-cols-4">
            {tracks.map((track, index) => (
              <div
                key={track}
                className={`fade-up is-visible rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-4 text-left ${index === 2 ? "bg-[color:var(--color-dark-surface)] text-[color:var(--color-text-on-dark)]" : ""}`}
                style={{ animationDelay: `${240 + index * 60}ms` }}
              >
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.06em] opacity-70">{track}</p>
                <p className="mt-3 text-sm leading-6 opacity-80">Stored with every solved board.</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-t-2xl border border-b-0 border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-4 text-left">
            <div className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2 font-semibold">
                <Workflow className="h-4 w-4 text-[color:var(--color-accent)]" strokeWidth={1.5} />
                One Page Template
              </span>
              <span className="font-mono text-xs text-[color:var(--color-text-secondary)]">Share-ready</span>
            </div>
          </div>
        </div>
      </section>

      <section className="px-[clamp(24px,5vw,60px)] py-[clamp(60px,8vw,96px)]">
        <div className="mx-auto grid max-w-[1100px] gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <ScrollReveal>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.06em] text-[color:var(--color-accent)]">Live code window</p>
            <h2 className="mt-3 max-w-[520px] font-display text-[clamp(2.5rem,5vw,3rem)] font-bold leading-[1.08] tracking-[-0.02em]">
              The generated answer appears while the board stays in view.
            </h2>
            <p className="mt-4 max-w-[60ch] leading-8 text-[color:var(--color-text-secondary)]">
              Cached speculative output starts the stream immediately. The final Gemini pass keeps writing from the full canvas without making the user wait on a blank panel.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={120}>
            <CodeWindow />
          </ScrollReveal>
        </div>
      </section>

      <section className="border-y border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-[clamp(24px,5vw,60px)] py-[clamp(60px,8vw,96px)]">
        <div className="mx-auto max-w-[1100px]">
          <ScrollReveal>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.06em] text-[color:var(--color-accent)]">Artifact system</p>
            <h2 className="mt-3 max-w-[720px] font-display text-[clamp(2.4rem,5vw,3rem)] font-bold leading-[1.1] tracking-[-0.02em]">
              Every solved board becomes a study unit, not a throwaway generation.
            </h2>
          </ScrollReveal>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <ScrollReveal key={feature.title} delay={index * 80}>
                  <article className="group h-full rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 hover:-translate-y-0.5 hover:border-[color:var(--color-dark-surface)] hover:bg-[color:var(--color-dark-surface)] hover:text-[color:var(--color-text-on-dark)]">
                    <Icon className="h-5 w-5 text-[color:var(--color-accent)]" strokeWidth={1.5} />
                    <h3 className="mt-5 text-xl font-semibold">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-[color:var(--color-text-secondary)] group-hover:text-[color:var(--color-text-on-dark)]">
                      {feature.body}
                    </p>
                    <div className="mt-5 inline-flex rounded-full border border-current px-3 py-1 font-mono text-xs">
                      {feature.metric}
                    </div>
                  </article>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-[clamp(24px,5vw,60px)] py-[clamp(60px,8vw,96px)]">
        <div className="mx-auto flex max-w-[1100px] flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.06em] text-[color:var(--color-accent)]">Start from a blank board</p>
            <h2 className="mt-3 font-display text-[clamp(2.3rem,5vw,3rem)] font-bold leading-[1.08]">Draw the algorithm. Keep the proof.</h2>
          </div>
          <Link href="/canvas/new" className="inline-flex h-12 items-center gap-2 rounded-full bg-[color:var(--color-accent)] px-7 text-sm font-semibold text-[color:var(--color-text-on-dark)] hover:bg-[color:var(--color-accent-hover)]">
            Try Now
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
        </div>
      </section>
    </div>
  );
}
