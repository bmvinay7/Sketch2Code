"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import type { CanvasConnection, FlowShape, ShapeType } from "@/types/canvas";
import type { PersistedScene } from "@/lib/canvasPersistence";

interface FlowCanvasProps {
  selectedShape: ShapeType;
  shapes: FlowShape[];
  connections: CanvasConnection[];
  activeTraceShapeId?: string;
  initialScene?: PersistedScene | null;
  onShapesChange: (shapes: FlowShape[]) => void;
  onConnectionsChange: (connections: CanvasConnection[]) => void;
  onShapeComplete: (shape: FlowShape) => void;
  onSceneChange?: (scene: PersistedScene) => void;
  onExcalidrawAPI?: (api: any) => void;
}

const Excalidraw = dynamic(async () => (await import("@excalidraw/excalidraw")).Excalidraw, {
  ssr: false
});

export function FlowCanvas(props: FlowCanvasProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="flex-1 bg-ink-0" style={{ height: "calc(100vh - 57px)" }} />;
  }

  // Excalidraw's initialData is read on mount; we pass the restored scene
  // if there is one. Live edits then flow through onChange.
  const initialData = props.initialScene
    ? {
        elements: props.initialScene.elements as readonly any[],
        appState: props.initialScene.appState as any,
        files: props.initialScene.files as any
      }
    : undefined;

  return (
    <div className="flex-1 relative min-w-0 bg-ink-0" style={{ height: "calc(100vh - 57px)" }}>
      <Excalidraw
        excalidrawAPI={props.onExcalidrawAPI}
        theme="dark"
        initialData={initialData}
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
        onChange={(elements, appState, files) => {
          // Mirror element-presence into the flat shapes prop so canAnalyze flips.
          if (elements.length > 0 && props.shapes.length === 0) {
            props.onShapesChange([
              {
                id: "excalidraw-layer",
                type: "process",
                label: "Excalidraw Node",
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                connections: [],
                isComplete: true
              }
            ]);
          } else if (elements.length === 0 && props.shapes.length > 0) {
            props.onShapesChange([]);
          }
          // Hand the full scene up so the parent can persist it.
          props.onSceneChange?.({
            elements: elements as unknown as unknown[],
            appState: appState as unknown as Record<string, unknown>,
            files: files as unknown as Record<string, unknown>
          });
        }}
      />
    </div>
  );
}
