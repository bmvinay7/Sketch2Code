"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import { useTheme } from "@/components/theme/ThemeProvider";
import { normalizeCanvasSnapshot } from "@/lib/flowcharts";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false }
);

export function ExcalidrawEmbed({
  scene,
  height = "420px",
  className = ""
}: {
  scene: unknown;
  height?: string;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const normalized = useMemo(() => normalizeCanvasSnapshot(scene), [scene]);
  const initialData = {
    elements: normalized.sceneElements,
    appState: {
      ...normalized.appState,
      viewModeEnabled: true,
      zenModeEnabled: true,
      gridSize: null
    },
    files: normalized.files
  } as unknown;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`animate-pulse rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] ${className}`}
        style={{ height }}
      />
    );
  }

  if (normalized.sceneElements.length === 0) {
    return (
      <div
        className={`grid place-items-center rounded-2xl border border-dashed border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-6 text-center text-sm text-[color:var(--color-text-secondary)] ${className}`}
        style={{ height }}
      >
        No flowchart snapshot was stored for this post.
      </div>
    );
  }

  return (
    <div
      className={`excalidraw-embed overflow-hidden rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-surface)] [&_.App-menu_top]:hidden [&_.excalidraw]:bg-transparent [&_.excalidraw__canvas]:bg-transparent [&_.layer-ui__wrapper]:hidden ${className}`}
      style={{ height }}
    >
      <Excalidraw
        theme={theme}
        viewModeEnabled
        zenModeEnabled
        gridModeEnabled={false}
        initialData={initialData as never}
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: false,
            clearCanvas: false,
            export: false,
            loadScene: false,
            saveAsImage: false,
            saveToActiveFile: false,
            toggleTheme: false
          }
        }}
      />
    </div>
  );
}
