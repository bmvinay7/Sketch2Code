import type { CSSProperties } from "react";

export function FloatingShapes({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {/* Lavender square — top-left, slightly rotated (matches AFFiNE reference) */}
      <div
        className="shape shape--square"
        style={{ "--pop": "var(--color-pop-lavender)", top: "22%", left: "8%", rotate: "-12deg" } as CSSProperties}
      />
      {/* Yellow circle — right side (matches AFFiNE reference) */}
      <div
        className="shape shape--circle"
        style={{ "--pop": "var(--color-pop-yellow)", top: "28%", right: "6%" } as CSSProperties}
      />
    </div>
  );
}
