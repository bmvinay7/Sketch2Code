const lines = [
  "def solve(nums):",
  "    best = nums[0]",
  "    for value in nums:",
  "        if value > best:",
  "            best = value",
  "    return best"
];

export function MockCodeStream() {
  return (
    <div className="relative rounded-xl border border-border bg-[#07070c] p-5 shadow-2xl shadow-cyan-500/10">
      <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">stream.py</span>
        <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">live</span>
      </div>
      <pre className="min-h-72 overflow-hidden font-mono text-sm leading-7 text-text-secondary">
        {lines.map((line, lineIndex) => (
          <span key={line} className="block">
            {line.split("").map((char, charIndex) => (
              <span
                key={`${lineIndex}-${charIndex}`}
                className="animate-[fade_600ms_ease_forwards] opacity-0"
                style={{ animationDelay: `${lineIndex * 220 + charIndex * 18}ms` }}
              >
                {char}
              </span>
            ))}
          </span>
        ))}
        <span className="cursor-blink ml-1 inline-block h-4 w-2 bg-accent align-middle" />
      </pre>
      <div className="absolute -inset-px -z-10 rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 blur-2xl" />
    </div>
  );
}
