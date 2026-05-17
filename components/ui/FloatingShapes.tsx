import type { CSSProperties } from "react";

export function FloatingShapes({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      <div
        className="shape shape--square"
        style={{ "--pop": "var(--color-pop-lavender)", top: "18%", left: "10%", rotate: "-10deg" } as CSSProperties}
      />
      <div
        className="shape shape--circle"
        style={{ "--pop": "var(--color-pop-yellow)", top: "30%", right: "8%" } as CSSProperties}
      />
      <div
        className="shape shape--pill"
        style={{ "--pop": "var(--color-pop-coral)", bottom: "14%", left: "18%", rotate: "8deg" } as CSSProperties}
      />
    </div>
  );
}
