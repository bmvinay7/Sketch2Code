"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, MessageSquareCode, ScanLine, Share2, Sparkles, Workflow } from "lucide-react";
import { FloatingShapes } from "@/components/ui/FloatingShapes";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

/* ── Typing-effect code snippet ── */
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

/* ── Feature cards ── */
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

/* ── Category tabs in hero ── */
const categories = [
  { title: "Algorithm Study", description: "Sketch flowcharts and get clean, runnable code in seconds." },
  { title: "Interview Prep", description: "Practice DSA problems visually and save solutions for later." },
  { title: "Canvas Workspace", description: "Draw on an infinite board with AI-powered code generation.", active: true },
  { title: "Community Sharing", description: "Publish your solved boards and learn from others." }
];

/* ── Code typing window ── */
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

/* ── Page ── */
export default function LandingPage() {
  return (
    <div>
      {/* ════════════════════════════════════════════════
          HERO SECTION  — Matches AFFiNE reference layout
          ════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-[clamp(24px,5vw,60px)] pb-0 pt-[clamp(60px,8vw,96px)]">
        <FloatingShapes />

        {/* ── Hero content ── */}
        <div className="relative z-10 mx-auto max-w-[1100px] text-center">
          {/* Badge pill */}
          <div className="fade-up is-visible inline-flex items-center gap-2 rounded-full border-[1.5px] border-[color:var(--color-text-primary)] px-4 py-1.5 font-mono text-[13px] font-medium text-[color:var(--color-text-primary)]">
            <Sparkles className="h-3.5 w-3.5 text-[color:var(--color-accent)]" strokeWidth={1.5} />
            Local-first
          </div>

          {/* Headline — mixed colour per design.md hero pattern */}
          <h1 className="fade-up is-visible stagger-1 mx-auto mt-8 max-w-[850px] font-display text-[clamp(3rem,7.5vw,5rem)] font-extrabold leading-[1.05] tracking-[-0.02em]">
            <span className="text-[color:var(--color-accent)]">Think big,</span>{" "}
            draw free —{"\n"}
            ideas flow endlessly
          </h1>

          {/* Subheading */}
          <p className="fade-up is-visible stagger-2 mx-auto mt-6 max-w-[560px] text-[17px] leading-[1.7] text-[color:var(--color-text-secondary)]">
            From sketch to code. Sketch2Code is the visual algorithm workspace that works for you.
          </p>

          {/* Primary CTA */}
          <div className="fade-up is-visible stagger-3 mt-8 flex justify-center">
            <Link
              href="/canvas/new"
              className="inline-flex h-[52px] items-center gap-2 rounded-full bg-[color:var(--color-accent)] px-8 text-[15px] font-semibold text-[color:var(--color-text-on-dark)] shadow-[0_4px_24px_rgba(25,113,255,0.25)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-[color:var(--color-accent-hover)] hover:shadow-[0_8px_32px_rgba(25,113,255,0.35)]"
            >
              Open workspace
            </Link>
          </div>
        </div>

        {/* ── Category cards row — AFFiNE style ── */}
        <div className="relative z-10 mx-auto mt-14 max-w-[980px]">
          <div className="grid gap-3 md:grid-cols-4">
            {categories.map((cat, index) => (
              <div
                key={cat.title}
                className={`fade-up is-visible rounded-2xl border p-5 text-left transition-all duration-150 ${
                  cat.active
                    ? "border-[color:var(--color-accent)] bg-[color:var(--color-dark-surface)] text-[color:var(--color-text-on-dark)]"
                    : "border-[color:var(--color-border)] bg-[color:var(--color-surface)] hover:-translate-y-0.5 hover:border-[color:#BBBBBB]"
                }`}
                style={{ animationDelay: `${240 + index * 60}ms` }}
              >
                <p className="text-[14px] font-semibold leading-5">{cat.title}</p>
                <p className={`mt-2 text-[13px] leading-[1.55] ${
                  cat.active ? "opacity-80" : "text-[color:var(--color-text-secondary)]"
                }`}>
                  {cat.description}
                </p>
              </div>
            ))}
          </div>

          {/* Toolbar bar — AFFiNE reference bottom bar */}
          <div className="mt-4 rounded-t-2xl border border-b-0 border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-4 text-left">
            <div className="flex items-center justify-between text-sm">
              <span className="inline-flex items-center gap-2 font-semibold">
                <Workflow className="h-4 w-4 text-[color:var(--color-accent)]" strokeWidth={1.5} />
                Canvas Template
              </span>
              <span className="font-mono text-xs text-[color:var(--color-text-secondary)]">Share-ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          CODE WINDOW SECTION
          ════════════════════════════════════════════════ */}
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

      {/* ════════════════════════════════════════════════
          FEATURES SECTION
          ════════════════════════════════════════════════ */}
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
                  <article className="group h-full rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-6 transition-all duration-150 hover:-translate-y-0.5 hover:border-[color:var(--color-dark-surface)] hover:bg-[color:var(--color-dark-surface)] hover:text-[color:var(--color-text-on-dark)]">
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

      {/* ════════════════════════════════════════════════
          BOTTOM CTA SECTION
          ════════════════════════════════════════════════ */}
      <section className="px-[clamp(24px,5vw,60px)] py-[clamp(60px,8vw,96px)]">
        <div className="mx-auto flex max-w-[1100px] flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.06em] text-[color:var(--color-accent)]">Start from a blank board</p>
            <h2 className="mt-3 font-display text-[clamp(2.3rem,5vw,3rem)] font-bold leading-[1.08]">Draw the algorithm. Keep the proof.</h2>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/community"
              className="inline-flex h-12 items-center gap-2 rounded-full border-[1.5px] border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 text-sm font-semibold text-[color:var(--color-text-primary)] transition-all duration-150 hover:border-[color:var(--color-text-primary)] hover:bg-[rgba(0,0,0,0.03)]"
            >
              Explore community
            </Link>
            <Link
              href="/canvas/new"
              className="inline-flex h-12 items-center gap-2 rounded-full bg-[color:var(--color-accent)] px-7 text-sm font-semibold text-[color:var(--color-text-on-dark)] transition-all duration-150 hover:-translate-y-px hover:bg-[color:var(--color-accent-hover)]"
            >
              Open workspace
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
