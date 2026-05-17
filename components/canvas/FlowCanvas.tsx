"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
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

// Dynamically import the WRAPPER (default export), not Excalidraw directly
const ExcalidrawWrapper = dynamic(
  () => import("@/components/canvas/ExcalidrawWrapper"),
  { ssr: false }
);

export function FlowCanvas(props: FlowCanvasProps) {
  const [mounted, setMounted] = useState(false);
  const [api, setApi] = useState<ExcalidrawHandle | null>(null);

  // Store callbacks in refs so they never cause re-renders
  const onSceneChangeRef = useRef(props.onSceneChange);
  const onShapesChangeRef = useRef(props.onShapesChange);
  const shapesRef = useRef(props.shapes);
  const connectionsRef = useRef(props.connections);

  useEffect(() => { onSceneChangeRef.current = props.onSceneChange; }, [props.onSceneChange]);
  useEffect(() => { onShapesChangeRef.current = props.onShapesChange; }, [props.onShapesChange]);
  useEffect(() => { shapesRef.current = props.shapes; }, [props.shapes]);
  useEffect(() => { connectionsRef.current = props.connections; }, [props.connections]);

  const initialData = props.snapshot
    ? {
        elements: props.snapshot.sceneElements,
        appState: props.snapshot.appState,
        files: props.snapshot.files
      }
    : undefined;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    props.onExcalidrawAPI?.(api);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  useEffect(() => {
    if (!api || !props.snapshot) return;
    api.updateScene({
      elements: props.snapshot.sceneElements,
      appState: props.snapshot.appState,
      files: props.snapshot.files
    });
  }, [api, props.snapshot]);

  // Stable handler passed to wrapper — never changes identity
  const handleSceneChange = useCallback((data: { elements: any; appState: any; files: any }) => {
    onSceneChangeRef.current?.({
      sceneElements: data.elements as ReadonlyArray<Record<string, unknown>>,
      appState: data.appState as unknown as Record<string, unknown>,
      files: data.files as Record<string, Record<string, unknown>>,
      shapes: shapesRef.current,
      connections: connectionsRef.current
    });

    if (data.elements.length > 0 && shapesRef.current.length === 0) {
      onShapesChangeRef.current([
        {
          id: "excalidraw-layer",
          type: "process",
          label: "Excalidraw Node",
          x: 0, y: 0, width: 0, height: 0,
          connections: [],
          isComplete: true
        }
      ]);
    } else if (data.elements.length === 0 && shapesRef.current.length > 0) {
      onShapesChangeRef.current([]);
    }
  }, []);

  const handleAPI = useCallback((apiInstance: ExcalidrawHandle | null) => {
    setApi(apiInstance);
  }, []);

  if (!mounted) {
    return <div className="h-full min-h-[420px] w-full flex-1 bg-[color:var(--background-strong)]" />;
  }

  return (
    <div className="relative h-full min-h-[420px] min-w-0 flex-1 overflow-hidden bg-[color:var(--background-strong)]">
      <ExcalidrawWrapper
        initialData={initialData}
        onExcalidrawAPI={handleAPI}
        onSceneChange={handleSceneChange}
      />
    </div>
  );
}
