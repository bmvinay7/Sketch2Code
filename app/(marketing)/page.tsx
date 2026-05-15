"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Braces, GitBranch, Layers3, MessageSquareCode, ScanLine, Share2, Sparkles, Workflow } from "lucide-react";

const pipeline = [
  { label: "Board parsed", value: "18 nodes", icon: ScanLine },
  { label: "Branches mapped", value: "7 edges", icon: GitBranch },
  { label: "Code streamed", value: "Python", icon: Braces }
];

const productModes = [
  {
    title: "Visual parsing",
    body: "Reads flowchart structure, labels, conditions, and sketch context before code generation begins.",
    icon: ScanLine
  },
  {
    title: "Code intelligence",
    body: "Streams language-specific code with syntax-aware presentation and follow-up critique.",
    icon: MessageSquareCode
  },
  {
    title: "Reusable artifacts",
    body: "Saves the board, code, context, comments, votes, and remix history as one workspace.",
    icon: Share2
  }
];

const feedItems = ["Binary Search", "Union Find", "Dijkstra", "Trie Insert"];

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: index * 0.06, ease: [0.21, 1, 0.34, 1] }
  })
};

function WorkflowScene() {
  return (
    <div className="relative min-h-[520px] overflow-hidden border-y border-[color:var(--border)] bg-[color:var(--background-strong)] system-grid lg:min-h-[620px]">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--background-strong)_0%,transparent_22%,transparent_78%,var(--background-strong)_100%)]" />
      <div className="absolute left-6 top-6 z-10 grid gap-2 md:left-10 md:top-10">
        {pipeline.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.35 + index * 0.08 }}
              className="flex w-[220px] items-center justify-between rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-glass)] px-3 py-2 backdrop-blur-xl"
            >
              <span className="flex items-center gap-2 text-xs font-semibold text-[color:var(--text-secondary)]">
                <Icon className="h-4 w-4 text-[color:var(--accent)]" />
                {item.label}
              </span>
              <span className="font-mono text-xs text-[color:var(--text-primary)]">{item.value}</span>
            </motion.div>
          );
        })}
      </div>

      <div className="relative z-10 mx-auto grid max-w-[1380px] gap-4 px-4 py-24 md:grid-cols-[1fr_360px] md:px-8 lg:grid-cols-[1fr_420px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="relative min-h-[440px] rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-glass)] p-4 shadow-[var(--shadow-soft)] backdrop-blur-xl"
        >
          <div className="flex items-center justify-between border-b border-[color:var(--border-soft)] pb-3">
            <div>
              <p className="text-xs font-bold uppercase text-[color:var(--text-muted)]">Canvas intake</p>
              <p className="text-sm font-semibold text-[color:var(--text-primary)]">Whiteboard algorithm: binary search</p>
            </div>
            <span className="rounded-md bg-[color:var(--accent-soft)] px-2 py-1 font-mono text-xs text-[color:var(--accent)]">AI parsing</span>
          </div>

          <div className="relative mt-6 h-[350px]">
            <div className="scan-line absolute left-0 right-0 top-0 h-px bg-[color:var(--accent)]" />
            <div className="absolute left-[8%] top-4 h-14 w-40 rounded-full border-2 border-[color:var(--accent)] bg-[color:var(--surface-elevated)]" />
            <div className="absolute left-[12%] top-8 text-sm font-semibold text-[color:var(--text-primary)]">Start sorted array</div>
            <div className="absolute left-[19%] top-[92px] h-20 w-px bg-[color:var(--border-strong)]" />
            <div className="absolute left-[8%] top-[176px] h-28 w-44 rotate-45 border-2 border-[color:var(--accent-3)] bg-[color:var(--surface-elevated)]" />
            <div className="absolute left-[12%] top-[210px] w-36 text-center text-sm font-semibold text-[color:var(--text-primary)]">target == mid?</div>
            <div className="absolute left-[39%] top-[228px] h-px w-[22%] bg-[color:var(--border-strong)]" />
            <div className="absolute right-[12%] top-[190px] h-20 w-52 rounded-lg border-2 border-[color:var(--accent-2)] bg-[color:var(--surface-elevated)] p-3 text-sm font-semibold text-[color:var(--text-primary)]">
              shift left/right pointer
            </div>
            <div className="absolute bottom-4 left-[11%] h-14 w-40 rounded-full border-2 border-[color:var(--success)] bg-[color:var(--surface-elevated)]" />
            <div className="absolute bottom-8 left-[15%] text-sm font-semibold text-[color:var(--text-primary)]">return index</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="rounded-lg border border-[color:var(--border)] bg-[#111417] p-4 shadow-[var(--shadow-soft)]"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <p className="text-xs font-bold uppercase text-white/40">Generated stream</p>
              <p className="text-sm font-semibold text-white">Python output</p>
            </div>
            <span className="rounded-md bg-emerald-300/10 px-2 py-1 font-mono text-xs text-emerald-300">live</span>
          </div>
          <pre className="mt-5 overflow-hidden whitespace-pre-wrap font-mono text-[13px] leading-7 text-white/86">
            <span className="text-sky-300">def</span> binary_search(nums, target):{"\n"}
            {"    "}left, right = <span className="text-amber-300">0</span>, len(nums) - <span className="text-amber-300">1</span>{"\n"}
            {"    "}<span className="text-sky-300">while</span> left &lt;= right:{"\n"}
            {"        "}mid = (left + right) // <span className="text-amber-300">2</span>{"\n"}
            {"        "}<span className="text-sky-300">if</span> nums[mid] == target:{"\n"}
            {"            "}<span className="text-sky-300">return</span> mid{"\n"}
            {"        "}<span className="text-sky-300">elif</span> nums[mid] &lt; target:{"\n"}
            {"            "}left = mid + <span className="text-amber-300">1</span>{"\n"}
            {"        "}<span className="text-sky-300">else</span>:{"\n"}
            {"            "}right = mid - <span className="text-amber-300">1</span>{"\n"}
            {"    "}<span className="text-sky-300">return</span> -<span className="text-amber-300">1</span>
            <span className="cursor-blink ml-1 inline-block h-4 w-2 bg-[color:var(--accent)] align-middle" />
          </pre>
          <div className="mt-5 grid gap-2">
            {feedItems.map((item) => (
              <div key={item} className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
                <span>{item}</span>
                <span className="font-mono text-emerald-300">remixable</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div>
      <section className="relative">
        <WorkflowScene />
        <div className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-[1380px] flex-col gap-6 px-4 pt-8 md:px-8 lg:pt-12">
          <motion.div initial="hidden" animate="show" className="max-w-[720px]">
            <motion.div custom={0} variants={fadeUp} className="inline-flex items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-glass)] px-3 py-2 text-xs font-bold uppercase text-[color:var(--text-secondary)] backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-[color:var(--accent)]" />
              Visual algorithm intelligence workspace
            </motion.div>
            <motion.h1 custom={1} variants={fadeUp} className="mt-5 max-w-[620px] font-display text-6xl font-extrabold leading-[1.02] text-[color:var(--text-primary)] max-lg:text-5xl max-sm:text-4xl">
              Sketch2Code
            </motion.h1>
            <motion.p custom={2} variants={fadeUp} className="mt-4 max-w-[560px] text-lg leading-8 text-[color:var(--text-secondary)] max-sm:text-base">
              Convert whiteboard logic into structured code, saved workspaces, and remixable algorithm artifacts.
            </motion.p>
            <motion.div custom={3} variants={fadeUp} className="mt-6 flex flex-wrap gap-3">
              <Link href="/canvas/new" className="inline-flex h-11 items-center gap-2 rounded-lg bg-[color:var(--accent)] px-4 text-sm font-semibold text-[color:var(--accent-contrast)] shadow-[var(--shadow-accent)]">
                Open workspace
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/community" className="inline-flex h-11 items-center gap-2 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-glass)] px-4 text-sm font-semibold text-[color:var(--text-primary)] backdrop-blur-xl">
                Explore artifacts
                <Layers3 className="h-4 w-4 text-[color:var(--accent-2)]" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-[color:var(--border-soft)] bg-[color:var(--surface-glass)] px-4 py-10 backdrop-blur-xl md:px-8">
        <div className="mx-auto grid max-w-[1380px] gap-4 md:grid-cols-3">
          {productModes.map((mode, index) => {
            const Icon = mode.icon;
            return (
              <motion.article
                key={mode.title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.38, delay: index * 0.05 }}
                className="rounded-lg border border-[color:var(--border)] bg-[color:var(--surface-elevated)] p-5"
              >
                <Icon className="h-5 w-5 text-[color:var(--accent)]" />
                <h2 className="mt-5 text-xl font-bold text-[color:var(--text-primary)]">{mode.title}</h2>
                <p className="mt-3 text-sm leading-6 text-[color:var(--text-secondary)]">{mode.body}</p>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="px-4 py-12 md:px-8">
        <div className="mx-auto grid max-w-[1380px] gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-xs font-bold uppercase text-[color:var(--accent)]">Artifact system</p>
            <h2 className="mt-3 max-w-[560px] text-4xl font-extrabold leading-tight text-[color:var(--text-primary)] max-sm:text-3xl">
              Every solved board becomes a durable unit of thinking.
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {["Canvas snapshot", "Generated code", "AI critique", "Votes and comments"].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--surface)] px-4 py-3">
                <Workflow className="h-4 w-4 text-[color:var(--accent)]" />
                <span className="text-sm font-semibold text-[color:var(--text-primary)]">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
