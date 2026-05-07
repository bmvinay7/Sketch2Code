"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import type { CanvasConnection, CanvasSceneSnapshot, FlowShape, ShapeType } from "@/types/canvas";

interface ExcalidrawHandle {
  getSceneElements: () => ReadonlyArray<Record<string, unknown>>;
  getAppState: () => Record<string, unknown>;
  getFiles: () => Record<string, Record<string, unknown>>;
  updateScene: (scene: {
    elements?: ReadonlyArray<Record<string, unknown>>;
    appState?: Record<string, unknown>;
    files?: Record<string, Record<string, unknown>>;
  }) => void;
}

interface FlowCanvasProps {
  selectedShape: ShapeType;
  shapes: FlowShape[];
  connections: CanvasConnection[];
  snapshot?: CanvasSceneSnapshot;
  activeTraceShapeId?: string;
  onShapesChange: (shapes: FlowShape[]) => void;
  onConnectionsChange: (connections: CanvasConnection[]) => void;
  onSceneChange?: (snapshot: CanvasSceneSnapshot) => void;
  onShapeComplete: (shape: FlowShape) => void;
  onExcalidrawAPI?: (api: ExcalidrawHandle | null) => void;
}

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false
  }
);

export function FlowCanvas(props: FlowCanvasProps) {
  const [mounted, setMounted] = useState(false);
  const [api, setApi] = useState<ExcalidrawHandle | null>(null);
  const initialData = props.snapshot
    ? ({
        elements: props.snapshot.sceneElements,
        appState: props.snapshot.appState,
        files: props.snapshot.files
      } as unknown)
    : undefined;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    props.onExcalidrawAPI?.(api);
  }, [api, props.onExcalidrawAPI]);

  useEffect(() => {
    if (!api || !props.snapshot) return;
    api.updateScene({
      elements: props.snapshot.sceneElements,
      appState: props.snapshot.appState,
      files: props.snapshot.files
    });
  }, [api, props.snapshot]);

  if (!mounted) {
    return <div className="flex-1 bg-[#08080d]" style={{ height: "calc(100svh - 6rem)" }} />;
  }

  return (
    <div className="relative min-w-0 flex-1 bg-transparent" style={{ height: "calc(100svh - 6rem)" }}>
      <Excalidraw
        excalidrawAPI={(instance) => setApi(instance as ExcalidrawHandle)}
        theme="dark"
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
        onChange={(elements, appState, files) => {
          props.onSceneChange?.({
            sceneElements: elements as ReadonlyArray<Record<string, unknown>>,
            appState: appState as unknown as Record<string, unknown>,
            files: files as Record<string, Record<string, unknown>>,
            shapes: props.shapes,
            connections: props.connections
          });

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
        }}
      />
    </div>
  );
}
