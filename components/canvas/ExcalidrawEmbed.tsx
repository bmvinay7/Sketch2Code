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

function getElementNumber(element: Record<string, unknown>, key: string) {
  const value = element[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function getPreviewAppState(elements: ReadonlyArray<Record<string, unknown>>, appState: Record<string, unknown>) {
  if (elements.length === 0) return appState;

  const bounds = elements.reduce<{ minX: number; minY: number; maxX: number; maxY: number }>(
    (current, element) => {
      const x = getElementNumber(element, "x");
      const y = getElementNumber(element, "y");
      const width = Math.max(getElementNumber(element, "width"), 40);
      const height = Math.max(getElementNumber(element, "height"), 28);

      return {
        minX: Math.min(current.minX, x),
        minY: Math.min(current.minY, y),
        maxX: Math.max(current.maxX, x + width),
        maxY: Math.max(current.maxY, y + height)
      };
    },
    { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity }
  );

  const sceneWidth = Math.max(bounds.maxX - bounds.minX, 1);
  const sceneHeight = Math.max(bounds.maxY - bounds.minY, 1);
  const zoom = Math.min(0.82, Math.max(0.34, Math.min(720 / sceneWidth, 320 / sceneHeight)));

  return {
    ...appState,
    scrollX: 28 - bounds.minX * zoom,
    scrollY: 28 - bounds.minY * zoom,
    zoom: { value: zoom },
    viewModeEnabled: true,
    zenModeEnabled: true,
    gridSize: null
  };
}

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
    appState: getPreviewAppState(normalized.sceneElements, normalized.appState),
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
