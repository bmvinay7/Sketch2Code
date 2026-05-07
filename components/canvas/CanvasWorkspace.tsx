"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { buildCanvasSnapshot, normalizeCanvasSnapshot } from "@/lib/flowcharts";
import type { CanvasConnection, CanvasSceneSnapshot, CodeLanguage, FlowShape, ShapeType, TraceStep } from "@/types/canvas";
import { ShapeToolbar } from "@/components/canvas/ShapeToolbar";
import { CanvasErrorBoundary } from "@/components/canvas/CanvasErrorBoundary";
import { CodePanel } from "@/components/code/CodePanel";
import { CodeErrorBoundary } from "@/components/code/CodeErrorBoundary";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";
const FlowCanvas = dynamic(() => import("@/components/canvas/FlowCanvas").then((mod) => mod.FlowCanvas), {
  ssr: false
});

interface ExcalidrawAPI {
  getSceneElements: () => ReadonlyArray<Record<string, unknown>>;
  getAppState: () => Record<string, unknown>;
  getFiles: () => Record<string, Record<string, unknown>>;
}

export function CanvasWorkspace({ sessionId }: { sessionId: string }) {
  const canPersist = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  const [selectedShape, setSelectedShape] = useState<ShapeType>("process");
  const [language, setLanguage] = useState<CodeLanguage>("python");
  const [problemContext, setProblemContext] = useState("");
  const [shapes, setShapes] = useState<FlowShape[]>([]);
  const [connections, setConnections] = useState<CanvasConnection[]>([]);
  const [initialSnapshot, setInitialSnapshot] = useState<CanvasSceneSnapshot>();
  const [snapshot, setSnapshot] = useState<CanvasSceneSnapshot>();
  const [code, setCode] = useState("");
  const [analysis, setAnalysis] = useState<string>();
  const [isStreaming, setIsStreaming] = useState(false);
  const [traceSteps, setTraceSteps] = useState<TraceStep[]>([]);
  const [activeTraceShapeId, setActiveTraceShapeId] = useState<string>();
  const [saveStatus, setSaveStatus] = useState<string>();
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawAPI | null>(null);

  const hasEnd = shapes.some((shape) => shape.type === "end");
  const hasGhost = shapes.some((shape) => shape.type === "decision") && !hasEnd;

  useEffect(() => {
    let cancelled = false;

    async function loadSavedSession() {
      if (!canPersist) return;

      try {
        const response = await fetch(`/api/flowcharts/${sessionId}`);
        if (!response.ok) {
          if (response.status === 401 || response.status === 404) return;
          throw new Error("Failed to load saved flowchart");
        }
        const payload = (await response.json()) as {
          flowchart?: {
            language: CodeLanguage;
            problem: string | null;
            generatedCode: string;
            shapes: unknown;
          } | null;
        };

        if (!payload.flowchart || cancelled) return;

        const restored = normalizeCanvasSnapshot(payload.flowchart.shapes);
        setLanguage(payload.flowchart.language);
        setProblemContext(payload.flowchart.problem ?? "");
        setCode(payload.flowchart.generatedCode);
        setShapes(restored.shapes);
        setConnections(restored.connections);
        setInitialSnapshot(restored);
        setSnapshot(restored);
        setSaveStatus("Loaded saved library entry.");
      } catch {
        if (!cancelled) {
          setSaveStatus("Saved session could not be restored.");
        }
      }
    }

    loadSavedSession();

    return () => {
      cancelled = true;
    };
  }, [canPersist, sessionId]);

  useEffect(() => {
    setSnapshot((current) =>
      current
        ? {
            ...current,
            shapes,
            connections
          }
        : current
    );
  }, [connections, shapes]);

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
        mimeType: "image/png"
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

  function getCanvasSnapshot() {
    if (!excalidrawAPI) return snapshot;

    return buildCanvasSnapshot({
      sceneElements: excalidrawAPI.getSceneElements(),
      appState: excalidrawAPI.getAppState(),
      files: excalidrawAPI.getFiles(),
      shapes,
      connections
    });
  }

  async function persistLibraryEntry(nextCode: string) {
    if (!canPersist) return;

    const currentSnapshot = getCanvasSnapshot();
    if (!currentSnapshot) return;

    const response = await fetch(`/api/flowcharts/${sessionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        problemContext,
        language,
        shapes: currentSnapshot,
        generatedCode: nextCode
      })
    });

    if (!response.ok) {
      setSaveStatus("Code generated, but the library entry was not saved.");
      return;
    }

    setSnapshot(currentSnapshot);
    setSaveStatus("Saved to your library.");
  }

  async function analyze() {
    const imageBase64 = await getCanvasImageBase64();
    if (!imageBase64) {
      setAnalysis("Please draw something on the canvas first.");
      return;
    }

    setIsStreaming(true);
    setCode("");
    setSaveStatus(undefined);

    let nextCode = "";

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
            if (dataLine) {
              const chunk = dataLine.slice(6).replaceAll("\\n", "\n");
              nextCode += chunk;
              setCode(nextCode);
            }
          }
        }
      }
    } catch {
      nextCode = "# Failed to generate code. Check backend connection.\n";
      setCode(nextCode);
    } finally {
      setIsStreaming(false);
    }

    await persistLibraryEntry(nextCode);

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
    setTraceSteps([]);
  }

  return (
    <div className="flex min-h-[calc(100svh-6rem)] flex-col lg:flex-row">
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
          snapshot={initialSnapshot}
          activeTraceShapeId={activeTraceShapeId}
          onShapesChange={setShapes}
          onConnectionsChange={setConnections}
          onSceneChange={setSnapshot}
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
      {saveStatus ? (
        <div className="fixed bottom-4 right-4 z-40 rounded-full border border-white/10 bg-[#08111f]/90 px-4 py-2 text-xs text-text-secondary shadow-lg">
          {saveStatus}
        </div>
      ) : null}
      <span className="sr-only">{traceSteps.length} trace steps loaded</span>
    </div>
  );
}
