"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { CanvasConnection, CodeLanguage, FlowShape, TraceStep } from "@/types/canvas";
import { ShapeToolbar, type ImageSource } from "@/components/canvas/ShapeToolbar";
import { CanvasErrorBoundary } from "@/components/canvas/CanvasErrorBoundary";
import { UploadedImagePreview } from "@/components/canvas/UploadedImagePreview";
import { CodePanel } from "@/components/code/CodePanel";
import { CodeErrorBoundary } from "@/components/code/CodeErrorBoundary";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4001";
const FlowCanvas = dynamic(() => import("@/components/canvas/FlowCanvas").then((mod) => mod.FlowCanvas), {
  ssr: false
});

const MAX_DIMENSION = 1280;

async function normalizeUploadedFile(file: File): Promise<{ base64: string; dataUrl: string }> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to decode image"));
    img.src = dataUrl;
  });
  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
  const targetWidth = Math.max(1, Math.round(image.width * scale));
  const targetHeight = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context unavailable");
  ctx.drawImage(image, 0, 0, targetWidth, targetHeight);
  const normalizedDataUrl = canvas.toDataURL("image/png");
  const base64 = normalizedDataUrl.split(",")[1] ?? "";
  return { base64, dataUrl: normalizedDataUrl };
}

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
  const [uploadedImage, setUploadedImage] = useState<{ base64: string; preview: string } | null>(null);

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

  async function getImageBase64(): Promise<string | null> {
    if (imageSource === "upload") {
      return uploadedImage?.base64 ?? null;
    }
    return getCanvasImageBase64();
  }

  async function handleUploadFile(file: File) {
    try {
      const { base64, dataUrl } = await normalizeUploadedFile(file);
      setUploadedImage({ base64, preview: dataUrl });
      setImageSource("upload");
    } catch (error) {
      console.error("Failed to process uploaded image", error);
      setAnalysis("Could not read that image. Please try a different file.");
    }
  }

  async function analyze() {
    const imageBase64 = await getImageBase64();
    if (!imageBase64) {
      setAnalysis(
        imageSource === "upload"
          ? "Please upload an image first."
          : "Please draw something on the canvas first."
      );
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

  const canAnalyze = imageSource === "upload"
    ? !!uploadedImage && !isStreaming
    : shapes.length > 0 && !isStreaming;

  return (
    <div className="flex min-h-[calc(100svh-4rem)] flex-col lg:flex-row">
      <ShapeToolbar
        language={language}
        problemContext={problemContext}
        canAnalyze={canAnalyze}
        isBusy={isStreaming}
        imageSource={imageSource}
        uploadedPreview={uploadedImage?.preview}
        onLanguageChange={setLanguage}
        onContextChange={setProblemContext}
        onAnalyze={analyze}
        onImageSourceChange={(source) => {
          setImageSource(source);
          if (source === "canvas") {
            // keep the uploaded image around in case the user toggles back
          }
        }}
        onImageUpload={(base64, preview) => {
          setUploadedImage({ base64, preview });
          setImageSource("upload");
        }}
        onClearUpload={() => {
          setUploadedImage(null);
        }}
      />
      {imageSource === "upload" ? (
        <UploadedImagePreview
          previewUrl={uploadedImage?.preview}
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
      <span className="sr-only">{traceSteps.length} trace steps loaded</span>
    </div>
  );
}
