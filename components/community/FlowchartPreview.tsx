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

function makeElementBase(id: string, type: string, x: number, y: number, width: number, height: number, strokeColor: string) {
  return {
    id,
    type,
    x,
    y,
    width,
    height,
    angle: 0,
    strokeColor,
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: type === "rectangle" ? { type: 3 } : null,
    seed: 120000 + id.length,
    version: 1,
    versionNonce: 240000 + id.length,
    isDeleted: false,
    boundElements: null,
    updated: 1,
    link: null,
    locked: false
  };
}

function makeText(id: string, text: string, x: number, y: number, width: number, strokeColor: string) {
  return {
    ...makeElementBase(id, "text", x, y, width, 24, strokeColor),
    text,
    fontSize: 18,
    fontFamily: 3,
    textAlign: "center",
    verticalAlign: "middle",
    baseline: 18,
    containerId: null,
    originalText: text,
    lineHeight: 1.25
  };
}

function makeArrow(id: string, x: number, y: number, width: number, height: number) {
  return {
    ...makeElementBase(id, "arrow", x, y, width, height, "#6b7280"),
    points: [
      [0, 0],
      [width, height]
    ],
    lastCommittedPoint: null,
    startBinding: null,
    endBinding: null,
    startArrowhead: null,
    endArrowhead: "arrow"
  };
}

function fallbackElements(title: string) {
  const compactTitle = title.length > 24 ? `${title.slice(0, 22)}...` : title;

  return [
    makeElementBase("fallback-start", "ellipse", 160, 70, 220, 54, "#0c8f78"),
    makeText("fallback-start-text", "Start input", 182, 85, 176, "#0c8f78"),
    makeArrow("fallback-a1", 270, 124, 0, 64),
    makeElementBase("fallback-branch", "diamond", 178, 188, 184, 116, "#d68200"),
    makeText("fallback-branch-text", compactTitle, 202, 232, 136, "#d68200"),
    makeArrow("fallback-a2", 362, 246, 102, 0),
    makeElementBase("fallback-process", "rectangle", 468, 214, 220, 66, "#2f68ff"),
    makeText("fallback-process-text", "Update state", 496, 234, 164, "#2f68ff"),
    makeArrow("fallback-a3", 270, 304, 0, 70),
    makeElementBase("fallback-end", "ellipse", 160, 378, 220, 54, "#0c8f78"),
    makeText("fallback-end-text", "Return result", 184, 394, 172, "#0c8f78")
  ];
}

export function FlowchartPreview({
  snapshot,
  title = "Algorithm flow",
  heightClass = "h-[420px]"
}: {
  snapshot: unknown;
  title?: string;
  heightClass?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const normalized = useMemo(() => normalizeCanvasSnapshot(snapshot), [snapshot]);
  const sceneElements = normalized.sceneElements.length > 0 ? normalized.sceneElements : fallbackElements(title);
  const initialData = {
    elements: sceneElements,
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
    return <div className={`${heightClass} rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--background-strong)]`} />;
  }

  return (
    <div className={`${heightClass} overflow-hidden rounded-lg border border-[color:var(--border-soft)] bg-[color:var(--background-strong)] [&_.excalidraw]:bg-transparent [&_.excalidraw__canvas]:bg-transparent`}>
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
