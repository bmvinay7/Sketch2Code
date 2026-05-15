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

export function FlowchartPreview({ snapshot, heightClass = "h-[420px]" }: { snapshot: unknown; heightClass?: string }) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const normalized = useMemo(() => normalizeCanvasSnapshot(snapshot), [snapshot]);
  const initialData = {
    elements: normalized.sceneElements,
    appState: {
      ...normalized.appState,
      viewModeEnabled: true
    },
    files: normalized.files
  } as unknown;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={`${heightClass} rounded-[28px] border border-[color:var(--border-soft)] bg-[color:var(--background-strong)]`} />;
  }

  if (normalized.sceneElements.length === 0) {
    return (
      <div className={`grid ${heightClass} place-items-center rounded-[28px] border border-dashed border-[color:var(--border-strong)] bg-[color:var(--background-strong)] text-sm text-[color:var(--text-secondary)]`}>
        No flowchart snapshot was stored for this post.
      </div>
    );
  }

  return (
    <div className={`${heightClass} overflow-hidden rounded-[28px] border border-[color:var(--border-soft)] bg-[color:var(--background-strong)] [&_.excalidraw]:bg-transparent [&_.excalidraw__canvas]:bg-transparent`}>
      <Excalidraw
        theme={theme}
        viewModeEnabled
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
