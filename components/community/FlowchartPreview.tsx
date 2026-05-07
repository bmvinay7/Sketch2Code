"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import { normalizeCanvasSnapshot } from "@/lib/flowcharts";

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  { ssr: false }
);

export function FlowchartPreview({ snapshot }: { snapshot: unknown }) {
  const [mounted, setMounted] = useState(false);
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
    return <div className="h-[420px] rounded-[28px] border border-white/10 bg-[#060b14]" />;
  }

  if (normalized.sceneElements.length === 0) {
    return (
      <div className="grid h-[420px] place-items-center rounded-[28px] border border-dashed border-white/15 bg-[#060b14] text-sm text-text-secondary">
        No flowchart snapshot was stored for this post.
      </div>
    );
  }

  return (
    <div className="h-[420px] overflow-hidden rounded-[28px] border border-white/10 bg-[#060b14]">
      <Excalidraw
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
