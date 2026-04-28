"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { CanvasConnection, CodeLanguage, FlowShape, ShapeType, TraceStep } from "@/types/canvas";
import { ShapeToolbar } from "@/components/canvas/ShapeToolbar";
import { CanvasErrorBoundary } from "@/components/canvas/CanvasErrorBoundary";
import { CodePanel } from "@/components/code/CodePanel";
import { CodeErrorBoundary } from "@/components/code/CodeErrorBoundary";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";
const FlowCanvas = dynamic(() => import("@/components/canvas/FlowCanvas").then((mod) => mod.FlowCanvas), {
  ssr: false
});

export function CanvasWorkspace({ sessionId }: { sessionId: string }) {
  const [selectedShape, setSelectedShape] = useState<ShapeType>("process");
  const [language, setLanguage] = useState<CodeLanguage>("python");
  const [problemContext, setProblemContext] = useState("");
  const [shapes, setShapes] = useState<FlowShape[]>([]);
  const [connections, setConnections] = useState<CanvasConnection[]>([]);
  const [code, setCode] = useState("");
  const [analysis, setAnalysis] = useState<string>();
  const [isStreaming, setIsStreaming] = useState(false);
  const [traceSteps, setTraceSteps] = useState<TraceStep[]>([]);
  const [activeTraceShapeId, setActiveTraceShapeId] = useState<string>();
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

  const hasEnd = shapes.some((shape) => shape.type === "end");
  const hasGhost = shapes.some((shape) => shape.type === "decision") && !hasEnd;

  async function getCanvasImageBase64() {
    if (!excalidrawAPI) return null;
    const elements = excalidrawAPI.getSceneElements();
    if (!elements || elements.length === 0) return null;
    try {
      const { exportToBlob } = await import("@excalidraw/excalidraw");
      const blob = await exportToBlob({
        elements,
        appState: excalidrawAPI.getAppState(),
        files: excalidrawAPI.getFiles(),
        mimeType: "image/png",
      });
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve((reader.result as string).split(",")[1]);
        };
        reader.readAsDataURL(blob);
      });
    } catch (err) {
      console.error("Failed to export image", err);
      return null;
    }
  }

  async function analyze() {
    const imageBase64 = await getCanvasImageBase64();
    if (!imageBase64) {
      setAnalysis("Please draw something on the canvas first.");
      return;
    }

    setIsStreaming(true);
    setCode("");
    
    // 1. Code Generation
    try {
      const response = await fetch(`${backendUrl}/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, language, problemContext, imageBase64 })
      });
      if (response.ok && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() ?? "";
          for (const event of events) {
            const dataLine = event.split("\n").find((line) => line.startsWith("data: "));
            if (dataLine) setCode((current) => current + dataLine.slice(6).replaceAll("\\n", "\n"));
          }
        }
      }
    } catch {
      setCode("# Failed to generate code. Check backend connection.\n");
    } finally {
      setIsStreaming(false);
    }

    // 2. Algorithm Analysis
    try {
      const response = await fetch(`${backendUrl}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, flowchartId: undefined, language, problemContext, imageBase64 })
      });
      const payload = (await response.json()) as { analysis?: string };
      setAnalysis(payload.analysis ?? "No analysis returned.");
    } catch {
      setAnalysis("Analysis requires the backend service.");
    }
  }

  async function trace() {
    // Trace mode can just be mocked or temporarily disabled since shapes aren't exact
    setTraceSteps([]);
  }

  return (
    <div className="flex min-h-[calc(100svh-4rem)] flex-col lg:flex-row">
      <ShapeToolbar
        selectedShape={selectedShape}
        language={language}
        problemContext={problemContext}
        canAnalyze={shapes.length > 0 && !isStreaming}
        canTrace={code.length > 0 && !isStreaming}
        isBusy={isStreaming}
        onShapeSelect={setSelectedShape}
        onLanguageChange={setLanguage}
        onContextChange={setProblemContext}
        onAnalyze={analyze}
        onTrace={trace}
      />
      <CanvasErrorBoundary>
        <FlowCanvas
          selectedShape={selectedShape}
          shapes={shapes}
          connections={connections}
          activeTraceShapeId={activeTraceShapeId}
          onShapesChange={setShapes}
          onConnectionsChange={setConnections}
          onShapeComplete={() => {}}
          onExcalidrawAPI={(api) => setExcalidrawAPI(api)}
        />
      </CanvasErrorBoundary>
      <CodeErrorBoundary>
        <CodePanel
          code={code}
          language={language}
          isStreaming={isStreaming}
          hasGhost={hasGhost}
          analysis={analysis}
          onCopy={() => navigator.clipboard.writeText(code)}
        />
      </CodeErrorBoundary>
      <span className="sr-only">{traceSteps.length} trace steps loaded</span>
    </div>
  );
}
