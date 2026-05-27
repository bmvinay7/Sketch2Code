import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MockCodeStream } from "@/components/code/MockCodeStream";

const features = [
  {
    index: "01",
    title: "honest streaming",
    body: "Your flowchart streams to code exactly as drawn. Bugs stay. Missing branches stay missing. The diagram is the source of truth."
  },
  {
    index: "02",
    title: "otsu preprocessing",
    body: "Photos of paper sketches run through Otsu's 1979 thresholding before the vision model sees them. Paper texture and lighting gradients are burned off."
  },
  {
    index: "03",
    title: "socratic analysis",
    body: "The reviewer never rewrites your algorithm. It tells you what your code does, where it diverges, and asks the questions that get you unstuck."
  }
];

const tickerItems = [
  "two pointers",
  "binary search",
  "sliding window",
  "topological sort",
  "kadane",
  "kmp",
  "dijkstra",
  "union find",
  "trie",
  "segment tree",
  "fenwick",
  "manacher",
  "kahn"
];

export default function LandingPage() {
  return (
    <div className="overflow-hidden">
      {/* HERO */}
      <section className="mx-auto max-w-[1480px] px-6 pb-20 pt-16 sm:pt-24 lg:px-10">
        <div className="grid items-end gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="eyebrow flex items-center gap-3">
              <span className="h-px w-8 bg-rule-strong" aria-hidden />
              a workspace for dsa learners
            </p>
            <h1 className="mono-headline mt-8 text-[15vw] text-paper-50 sm:text-[80px] lg:text-[112px]">
              draw it.
              <br />
              <span className="text-paper-200">stream it.</span>
              <br />
              <span className="serif-italic inline-block text-paper-50">own the bug.</span>
            </h1>
            <p className="mt-10 max-w-md font-sans text-[15px] leading-relaxed text-paper-100">
              Sketch2Code is a deliberately faithful flowchart-to-code workspace. It preserves your logic — even when it&apos;s wrong — so you can see, in real code, exactly what your diagram says.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link
                href="/canvas/new"
                className="group relative inline-flex h-12 items-center gap-3 border border-lime bg-lime px-6 font-mono text-[12px] uppercase tracking-cap text-ink-0 transition-all hover:bg-paper-50 hover:border-paper-50"
              >
                <span className="tabular text-[10px] text-ink-0/60">[1]</span>
                open the canvas
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                href="/community"
                className="link-underline font-mono text-[12px] uppercase tracking-cap text-paper-100 hover:text-paper-50"
              >
                browse the library →
              </Link>
            </div>
          </div>
          <div className="lg:translate-y-4">
            <MockCodeStream />
          </div>
        </div>
      </section>

      {/* TICKER */}
      <section aria-hidden className="border-y border-rule overflow-hidden bg-ink-50/40">
        <div className="flex whitespace-nowrap marquee py-4 font-mono text-[12px] uppercase tracking-cap text-paper-200">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="flex items-center gap-6 px-6">
              <span className="text-paper-300">/</span>
              <span>{item}</span>
            </span>
          ))}
        </div>
      </section>

      {/* MANIFESTO + FEATURES */}
      <section className="mx-auto grid max-w-[1480px] gap-16 px-6 py-24 lg:grid-cols-[0.42fr_0.58fr] lg:px-10">
        <div>
          <p className="eyebrow">manifesto · 003</p>
          <p className="mt-6 font-sans text-[20px] leading-relaxed text-paper-50">
            Most flowchart tools <span className="serif-italic text-paper-50">improve</span> your drawing on the way out. We don&apos;t. If your decision diamond is missing an exit, the generated code is missing the exit too. That gap is where you learn.
          </p>
          <div className="hairline mt-12 w-24" />
          <p className="mt-6 max-w-sm font-mono text-[11px] uppercase leading-loose tracking-cap text-paper-200">
            three things <span className="text-paper-50">we will never do</span> · rewrite your logic · hide the gemini key in the browser · execute untraced user code outside a sandbox
          </p>
        </div>
        <div className="grid gap-px bg-rule">
          {features.map((f) => (
            <article key={f.index} className="bg-ink-0 p-8 transition-colors hover:bg-ink-50">
              <header className="flex items-baseline justify-between border-b border-rule pb-4">
                <span className="index-tag">{f.index} / 03</span>
                <span className="font-mono text-[10px] uppercase tracking-cap text-paper-300">feature</span>
              </header>
              <h3 className="mt-6 font-mono text-[20px] font-bold lowercase tracking-tightest text-paper-50">{f.title}</h3>
              <p className="mt-4 text-[14px] leading-relaxed text-paper-100">{f.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="border-t border-rule">
        <div className="mx-auto flex max-w-[1480px] flex-col items-start justify-between gap-10 px-6 py-20 lg:flex-row lg:items-end lg:px-10">
          <div>
            <p className="eyebrow">end · 04</p>
            <p className="mono-headline mt-6 text-[48px] text-paper-50 sm:text-[72px]">
              your turn.
              <span className="serif-italic text-lime"> draw something.</span>
            </p>
          </div>
          <Link
            href="/canvas/new"
            className="group inline-flex h-14 items-center gap-3 border border-rule-strong px-6 font-mono text-[13px] uppercase tracking-cap text-paper-50 transition-colors hover:bg-paper-50 hover:text-ink-0"
          >
            open canvas
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-rule">
        <div className="mx-auto flex max-w-[1480px] items-center justify-between px-6 py-6 font-mono text-[11px] uppercase tracking-cap text-paper-300 lg:px-10">
          <span>sketch2code · the diagram is the source of truth</span>
          <span className="tabular">© 2026</span>
        </div>
      </footer>
    </div>
  );
}
