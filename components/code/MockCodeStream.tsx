const lines = [
  { ln: 1, text: "def max_element(nums):" },
  { ln: 2, text: "    best = nums[0]" },
  { ln: 3, text: "    for value in nums:" },
  { ln: 4, text: "        if value > best:" },
  { ln: 5, text: "            best = value" },
  { ln: 6, text: "    return best" }
];

export function MockCodeStream() {
  return (
    <div className="relative">
      <div className="flex items-center justify-between border border-rule bg-ink-50 px-4 py-2.5">
        <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-cap text-paper-200">
          <span className="text-paper-300">file</span>
          <span className="text-paper-50">max_element.py</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-cap text-lime">
          <span className="h-1.5 w-1.5 bg-lime cursor-blink" />
          streaming
        </div>
      </div>
      <div className="crosshair relative border-x border-b border-rule bg-ink-50 px-4 py-5 font-mono text-[13px] leading-[1.85]">
        {lines.map((line, i) => (
          <div key={line.ln} className="fade-up flex gap-5" style={{ animationDelay: `${150 + i * 110}ms` }}>
            <span className="tabular w-4 select-none text-right text-paper-300">{line.ln}</span>
            <span className="text-paper-50">{line.text}</span>
          </div>
        ))}
        <div className="flex gap-5">
          <span className="tabular w-4 select-none text-right text-paper-300">{lines.length + 1}</span>
          <span className="cursor-blink inline-block h-[1.1em] w-[0.55em] bg-lime align-middle" />
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-cap text-paper-300">
        <span>gemini · 2.5 flash</span>
        <span className="tabular">6 lines · 0.42s</span>
      </div>
    </div>
  );
}
