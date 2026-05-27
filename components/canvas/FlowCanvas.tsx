"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import "@excalidraw/excalidraw/index.css";
import type { CanvasConnection, FlowShape, ShapeType } from "@/types/canvas";

interface FlowCanvasProps {
  selectedShape: ShapeType;
  shapes: FlowShape[];
  connections: CanvasConnection[];
  activeTraceShapeId?: string;
  onShapesChange: (shapes: FlowShape[]) => void;
  onConnectionsChange: (connections: CanvasConnection[]) => void;
  onShapeComplete: (shape: FlowShape) => void;
  onExcalidrawAPI?: (api: any) => void;
}

const Excalidraw = dynamic(
  async () => (await import("@excalidraw/excalidraw")).Excalidraw,
  {
    ssr: false,
  }
);

export function FlowCanvas(props: FlowCanvasProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="flex-1 bg-ink-0" style={{ height: "calc(100vh - 57px)" }} />;
  }

  return (
    <div className="flex-1 relative min-w-0 bg-ink-0" style={{ height: "calc(100vh - 57px)" }}>
      <Excalidraw 
        excalidrawAPI={props.onExcalidrawAPI}
        theme="dark"
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: false,
            clearCanvas: false,
            export: false,
            loadScene: false,
            saveAsImage: false,
            saveToActiveFile: false,
            toggleTheme: false,
          }
        }}
        onChange={(elements) => {
          if (elements.length > 0 && props.shapes.length === 0) {
            props.onShapesChange([{ id: "excalidraw-layer", type: "process", label: "Excalidraw Node", x: 0, y: 0, width: 0, height: 0, connections: [], isComplete: true }]);
          } else if (elements.length === 0 && props.shapes.length > 0) {
            props.onShapesChange([]);
          }
        }}
      />
    </div>
  );
}
