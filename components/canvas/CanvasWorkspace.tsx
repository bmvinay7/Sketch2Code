"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { CanvasConnection, CodeLanguage, FlowShape, TraceStep } from "@/types/canvas";
import { ShapeToolbar, type ImageSource } from "@/components/canvas/ShapeToolbar";
import { CanvasErrorBoundary } from "@/components/canvas/CanvasErrorBoundary";
import { UploadedImagePreview } from "@/components/canvas/UploadedImagePreview";
import { PublishDialog } from "@/components/canvas/PublishDialog";
import { CodePanel } from "@/components/code/CodePanel";
import { CodeErrorBoundary } from "@/components/code/CodeErrorBoundary";
import { prepareImageFromBlob, prepareImageFromFile, type PreparedImage } from "@/lib/image";

// Streaming + analyze now run as Next.js Route Handlers on the same origin,
// so we always use relative paths. The old NEXT_PUBLIC_BACKEND_URL env var
// is dead and intentionally not read anywhere.
const FlowCanvas = dynamic(() => import("@/components/canvas/FlowCanvas").then((mod) => mod.FlowCanvas), {
  ssr: false
});

interface UploadedImageState extends PreparedImage {}

export function CanvasWorkspace({ sessionId }: { sessionId: string }) {
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
        mimeType: "image/png",
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

    // 1. Code Generation
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
      }
    } catch {
      setCode("# Failed to generate code. Check backend connection.\n");
    } finally {
      setIsStreaming(false);
    }

    // 2. Algorithm Analysis
    try {
      const response = await fetch(`/api/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, language, problemContext, imageBase64: prepared.base64 })
      });
      const payload = (await response.json()) as { analysis?: string };
      setAnalysis(payload.analysis ?? "No analysis returned.");
    } catch {
      setAnalysis("Analysis requires the backend service.");
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
            onShapesChange={setShapes}
            onConnectionsChange={setConnections}
            onShapeComplete={() => {}}
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
