"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { CanvasConnection, CodeLanguage, FlowShape, TraceStep } from "@/types/canvas";
import { ShapeToolbar, type ImageSource } from "@/components/canvas/ShapeToolbar";
import { CanvasErrorBoundary } from "@/components/canvas/CanvasErrorBoundary";
import { UploadedImagePreview } from "@/components/canvas/UploadedImagePreview";
import { PublishDialog } from "@/components/canvas/PublishDialog";
import { CodePanel } from "@/components/code/CodePanel";
import { CodeErrorBoundary } from "@/components/code/CodeErrorBoundary";
import { prepareImageFromBlob, prepareImageFromFile, type PreparedImage } from "@/lib/image";
import {
  clearCanvasDraft,
  loadCanvasDraft,
  saveCanvasDraft,
  type PersistedScene
} from "@/lib/canvasPersistence";

const FlowCanvas = dynamic(() => import("@/components/canvas/FlowCanvas").then((mod) => mod.FlowCanvas), {
  ssr: false
});

interface UploadedImageState extends PreparedImage {}

const SAVE_DEBOUNCE_MS = 600;

export function CanvasWorkspace({ sessionId }: { sessionId: string }) {
  // Hydrated flag prevents the save effect from firing on the initial render
  // (before the load effect has had a chance to populate state from storage).
  const [hydrated, setHydrated] = useState(false);

  const [language, setLanguage] = useState<CodeLanguage>("python");
  const [problemContext, setProblemContext] = useState("");
  const [shapes, setShapes] = useState<FlowShape[]>([]);
  const [connections, setConnections] = useState<CanvasConnection[]>([]);
  const [code, setCode] = useState("");
  const [analysis, setAnalysis] = useState<string>();
  const [isStreaming, setIsStreaming] = useState(false);
  const [traceSteps] = useState<TraceStep[]>([]);
  const [activeTraceShapeId] = useState<string>();
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);
  const [imageSource, setImageSource] = useState<ImageSource>("canvas");
  const [uploadedImage, setUploadedImage] = useState<UploadedImageState | null>(null);
  const [lastThreshold, setLastThreshold] = useState<number | null>(null);
  const [showPublish, setShowPublish] = useState(false);

  // Restored scene for Excalidraw — set once on mount, then becomes the seed
  // for FlowCanvas's initialData. Live scene updates flow through the
  // sceneRef below so the persistence effect can read the latest.
  const [initialScene, setInitialScene] = useState<PersistedScene | null>(null);
  const sceneRef = useRef<PersistedScene | null>(null);

  // 1) LOAD ONCE ON MOUNT.
  useEffect(() => {
    const draft = loadCanvasDraft();
    if (draft) {
      setLanguage(draft.language);
      setProblemContext(draft.problemContext);
      setImageSource(draft.imageSource);
      setUploadedImage(draft.uploadedImage);
      setLastThreshold(draft.uploadedImage?.threshold ?? null);
      setCode(draft.code);
      setAnalysis(draft.analysis ?? undefined);
      if (draft.scene) {
        setInitialScene(draft.scene);
        sceneRef.current = draft.scene;
      }
    }
    setHydrated(true);
  }, []);

  // 2) SAVE ON CHANGES (debounced).
  useEffect(() => {
    if (!hydrated) return;
    const t = window.setTimeout(() => {
      saveCanvasDraft({
        language,
        problemContext,
        imageSource,
        uploadedImage,
        scene: sceneRef.current,
        code,
        analysis: analysis ?? null
      });
    }, SAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(t);
  }, [hydrated, language, problemContext, imageSource, uploadedImage, code, analysis, shapes]);

  const hasEnd = shapes.some((shape) => shape.type === "end");
  const hasGhost = shapes.some((shape) => shape.type === "decision") && !hasEnd;

  async function getCanvasImageBase64(): Promise<{ base64: string; threshold: number } | null> {
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
      const prepared = await prepareImageFromBlob(blob);
      return { base64: prepared.base64, threshold: prepared.threshold };
    } catch (err) {
      console.error("Failed to export image", err);
      return null;
    }
  }

  async function getImageBase64(): Promise<{ base64: string; threshold: number } | null> {
    if (imageSource === "upload") {
      if (!uploadedImage) return null;
      return { base64: uploadedImage.base64, threshold: uploadedImage.threshold };
    }
    return getCanvasImageBase64();
  }

  async function handleUploadFile(file: File) {
    try {
      const prepared = await prepareImageFromFile(file);
      setUploadedImage(prepared);
      setLastThreshold(prepared.threshold);
      setImageSource("upload");
    } catch (error) {
      console.error("Failed to process uploaded image", error);
      setAnalysis("Could not read that image. Please try a different file.");
    }
  }

  function handleClearDraft() {
    if (typeof window !== "undefined" && !window.confirm("Clear your saved draft? This can't be undone.")) {
      return;
    }
    clearCanvasDraft();
    setLanguage("python");
    setProblemContext("");
    setShapes([]);
    setConnections([]);
    setCode("");
    setAnalysis(undefined);
    setImageSource("canvas");
    setUploadedImage(null);
    setLastThreshold(null);
    setInitialScene(null);
    sceneRef.current = null;
    excalidrawAPI?.updateScene?.({ elements: [], appState: { collaborators: [] } });
  }

  async function analyze() {
    const prepared = await getImageBase64();
    if (!prepared) {
      setAnalysis(
        imageSource === "upload"
          ? "Please upload an image first."
          : "Please draw something on the canvas first."
      );
      return;
    }

    setLastThreshold(prepared.threshold);
    setIsStreaming(true);
    setCode("");

    try {
      const response = await fetch(`/api/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, language, problemContext, imageBase64: prepared.base64 })
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
      } else if (response.status === 401) {
        setCode("# Sign in to generate code from your sketch.\n");
      } else if (response.status === 429) {
        setCode("# Rate limit hit (60/hour per user). Try again in a bit.\n");
      }
    } catch {
      setCode("# Failed to generate code. Check your connection.\n");
    } finally {
      setIsStreaming(false);
    }

    try {
      const response = await fetch(`/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, language, problemContext, imageBase64: prepared.base64 })
      });
      if (response.status === 401) {
        setAnalysis("Sign in to analyze.");
        return;
      }
      if (response.status === 429) {
        setAnalysis("Rate limit hit. Try again in an hour.");
        return;
      }
      const payload = (await response.json()) as { analysis?: string };
      setAnalysis(payload.analysis ?? "No analysis returned.");
    } catch {
      setAnalysis("Analysis failed. Check your connection.");
    }
  }

  const canAnalyze = imageSource === "upload"
    ? !!uploadedImage && !isStreaming
    : shapes.length > 0 && !isStreaming;
  const canPublish = code.length > 0 && !isStreaming;

  return (
    <div className="flex min-h-[calc(100vh-57px)] flex-col lg:flex-row">
      <ShapeToolbar
        language={language}
        problemContext={problemContext}
        canAnalyze={canAnalyze}
        canPublish={canPublish}
        isBusy={isStreaming}
        imageSource={imageSource}
        uploadedPreview={uploadedImage?.previewDataUrl}
        otsuThreshold={lastThreshold}
        onLanguageChange={setLanguage}
        onContextChange={setProblemContext}
        onAnalyze={analyze}
        onPublish={() => setShowPublish(true)}
        onClearDraft={handleClearDraft}
        onImageSourceChange={(source) => setImageSource(source)}
        onImageUpload={async (file) => handleUploadFile(file)}
        onClearUpload={() => {
          setUploadedImage(null);
          setLastThreshold(null);
        }}
      />
      {imageSource === "upload" ? (
        <UploadedImagePreview
          previewUrl={uploadedImage?.previewDataUrl}
          threshold={uploadedImage?.threshold ?? null}
          onSelectFile={handleUploadFile}
        />
      ) : (
        <CanvasErrorBoundary>
          <FlowCanvas
            selectedShape="process"
            shapes={shapes}
            connections={connections}
            activeTraceShapeId={activeTraceShapeId}
            initialScene={initialScene}
            onShapesChange={setShapes}
            onConnectionsChange={setConnections}
            onShapeComplete={() => {}}
            onSceneChange={(scene) => {
              sceneRef.current = scene;
              // Nudge the persistence effect — set a harmless state to retrigger.
              setShapes((prev) => (prev.length === 0 && scene.elements.length > 0 ? [...prev] : prev));
            }}
            onExcalidrawAPI={(api) => setExcalidrawAPI(api)}
          />
        </CanvasErrorBoundary>
      )}
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
      {showPublish && (
        <PublishDialog
          defaultTitle={problemContext.slice(0, 80) || "Untitled flowchart"}
          language={language}
          problemContext={problemContext}
          generatedCode={code}
          onClose={() => setShowPublish(false)}
        />
      )}
      <span className="sr-only">{traceSteps.length} trace steps loaded</span>
    </div>
  );
}
