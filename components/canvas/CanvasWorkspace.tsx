"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Braces, ChevronLeft, ChevronRight, Command, Eye, Loader2, PanelLeftClose, PanelRightClose, Play, Save, Share2 } from "lucide-react";
import { buildCanvasSnapshot, generateSmartTitle, inferProblemContext, normalizeCanvasSnapshot } from "@/lib/flowcharts";
import type { CanvasConnection, CanvasSceneSnapshot, CodeLanguage, FlowShape, ShapeType } from "@/types/canvas";
import { ShapeToolbar } from "@/components/canvas/ShapeToolbar";
import { CanvasErrorBoundary } from "@/components/canvas/CanvasErrorBoundary";
import { CodePanel } from "@/components/code/CodePanel";
import { CodeErrorBoundary } from "@/components/code/CodeErrorBoundary";
import { cn } from "@/lib/utils";

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
  const [title, setTitle] = useState("");
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
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("Ready");
  const [activeTraceShapeId] = useState<string>();
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawAPI | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);

  const inferredContext = useMemo(() => inferProblemContext(snapshot), [snapshot]);
  const effectiveContext = problemContext.trim() || inferredContext;
  const hasContent = shapes.length > 0 || (snapshot?.sceneElements.length ?? 0) > 0;
  const workspaceTitle = title || generateSmartTitle(effectiveContext, code, language);

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
            title: string;
            language: CodeLanguage;
            problem: string | null;
            generatedCode: string;
            shapes: unknown;
          } | null;
        };

        if (!payload.flowchart || cancelled) return;

        const restored = normalizeCanvasSnapshot(payload.flowchart.shapes);
        setTitle(payload.flowchart.title);
        setLanguage(payload.flowchart.language);
        setProblemContext(payload.flowchart.problem ?? "");
        setCode(payload.flowchart.generatedCode);
        setShapes(restored.shapes);
        setConnections(restored.connections);
        setInitialSnapshot(restored);
        setSnapshot(restored);
        setSaveStatus("Restored");
      } catch {
        if (!cancelled) setSaveStatus("Restore failed");
      }
    }

    loadSavedSession();

    return () => {
      cancelled = true;
    };
  }, [canPersist, sessionId]);

  useEffect(() => {
    setSnapshot((current) => (current ? { ...current, shapes, connections } : current));
  }, [connections, shapes]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!(event.metaKey || event.ctrlKey)) return;

      if (event.key.toLowerCase() === "enter") {
        event.preventDefault();
        if (hasContent && !isStreaming) void analyze();
      }

      if (event.key.toLowerCase() === "s") {
        event.preventDefault();
        void persistLibraryEntry(code);
      }

      if (event.key.toLowerCase() === "b") {
        event.preventDefault();
        setLeftOpen((current) => !current);
      }

      if (event.key.toLowerCase() === "j") {
        event.preventDefault();
        setRightOpen((current) => !current);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

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

      return await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error("Failed to export image", error);
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

  async function persistLibraryEntry(nextCode: string, options?: { silent?: boolean }) {
    if (!canPersist) {
      if (!options?.silent) setSaveStatus("Sign in to save");
      return;
    }

    const currentSnapshot = getCanvasSnapshot();
    if (!currentSnapshot) return;

    const generatedTitle = title.trim() || generateSmartTitle(effectiveContext, nextCode, language);

    if (!options?.silent) {
      setIsSaving(true);
      setSaveStatus("Saving");
    }

    try {
      const response = await fetch(`/api/flowcharts/${sessionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: generatedTitle,
          problemContext: effectiveContext,
          language,
          shapes: currentSnapshot,
          generatedCode: nextCode
        })
      });

      if (!response.ok) {
        setSaveStatus("Save failed");
        return;
      }

      setTitle(generatedTitle);
      setSnapshot(currentSnapshot);
      setSaveStatus("Saved");
    } finally {
      if (!options?.silent) setIsSaving(false);
    }
  }

  async function analyze(uploadedImageBase64?: string) {
    const imageBase64 = uploadedImageBase64 || (await getCanvasImageBase64());
    if (!imageBase64) {
      setAnalysis("Draw or upload a flowchart before generating.");
      return;
    }

    setIsStreaming(true);
    setCode("");
    setAnalysis(undefined);
    setSaveStatus("Parsing board");

    let nextCode = "";

    try {
      const response = await fetch("/api/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, language, problemContext: effectiveContext, imageBase64 })
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
            if (!dataLine) continue;

            const chunk = dataLine.slice(6).replaceAll("\\n", "\n");
            nextCode += chunk;
            setCode(nextCode);
          }
        }
      }
    } catch {
      nextCode = "# Failed to generate code. Check the Gemini configuration.\n";
      setCode(nextCode);
    } finally {
      setIsStreaming(false);
    }

    await persistLibraryEntry(nextCode, { silent: true });

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, language, problemContext: effectiveContext, imageBase64 })
      });
      const payload = (await response.json()) as { analysis?: string };
      setAnalysis(payload.analysis ?? "No analysis returned.");
      setSaveStatus("Generated");
    } catch {
      setAnalysis("Analysis requires a valid Gemini key.");
      setSaveStatus("Code ready");
    }
  }

  const handleExcalidrawAPI = useCallback((api: ExcalidrawAPI | null) => setExcalidrawAPI(api), []);
  const handleSceneChange = useCallback((nextSnapshot: CanvasSceneSnapshot) => setSnapshot(nextSnapshot), []);

  async function publish() {
    setIsPublishing(true);

    try {
      if (!code.trim()) {
        setSaveStatus("Generate first");
        return;
      }

      await persistLibraryEntry(code, { silent: true });
      const response = await fetch(`/api/flowcharts/${sessionId}/publish`, { method: "POST" });
      if (!response.ok) throw new Error("Failed to publish");
      setSaveStatus("Published");
    } catch {
      setSaveStatus("Publish failed");
    } finally {
      setIsPublishing(false);
    }
  }

  return (
    <section className="h-[calc(100dvh-4rem)] overflow-hidden">
      <div className="flex h-full flex-col">
        <div className="flex min-h-16 items-center justify-between gap-3 border-b border-[color:var(--border)] bg-[color:var(--surface-glass)] px-3 backdrop-blur-xl">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Toggle controls"
              onClick={() => setLeftOpen((current) => !current)}
              className="control grid h-10 w-10 place-items-center"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
            <div className="min-w-0">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={workspaceTitle}
                className="w-full max-w-[520px] border-none bg-transparent text-lg font-bold text-[color:var(--text-primary)] outline-none placeholder:text-[color:var(--text-muted)]"
              />
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[color:var(--text-muted)]">
                <span className="inline-flex items-center gap-1"><Command className="h-3 w-3" /> Enter generate</span>
                <span>Cmd S save</span>
                <span>{saveStatus}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={cn("hidden rounded-md border px-2 py-1 text-xs font-semibold sm:inline-flex", isStreaming ? "border-[color:var(--accent)] text-[color:var(--accent)]" : "border-[color:var(--border)] text-[color:var(--text-secondary)]")}>
              {isStreaming ? "Streaming" : hasContent ? "Ready" : "Empty"}
            </span>
            <button
              type="button"
              onClick={() => void persistLibraryEntry(code)}
              disabled={isSaving}
              className="control inline-flex items-center gap-2 px-3 text-sm font-semibold"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 text-[color:var(--accent-2)]" />}
              <span className="hidden sm:inline">Save</span>
            </button>
            <button
              type="button"
              onClick={() => void analyze()}
              disabled={!hasContent || isStreaming}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[color:var(--accent)] px-3 text-sm font-semibold text-[color:var(--accent-contrast)] disabled:opacity-50"
            >
              {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Generate
            </button>
            <button
              type="button"
              aria-label="Toggle code panel"
              onClick={() => setRightOpen((current) => !current)}
              className="control grid h-10 w-10 place-items-center"
            >
              <PanelRightClose className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div
          className="grid min-h-0 flex-1 gap-0 transition-[grid-template-columns] duration-300"
          style={{
            gridTemplateColumns: `${leftOpen ? "300px" : "0px"} minmax(0, 1fr) ${rightOpen ? "410px" : "0px"}`
          }}
        >
          <div className="min-h-0 overflow-hidden border-r border-[color:var(--border)] bg-[color:var(--surface)]">
            <ShapeToolbar
              selectedShape={selectedShape}
              language={language}
              title={title}
              problemContext={problemContext}
              inferredContext={inferredContext}
              canAnalyze={hasContent && !isStreaming}
              isBusy={isStreaming}
              isSaving={isSaving}
              onShapeSelect={setSelectedShape}
              onLanguageChange={setLanguage}
              onContextChange={setProblemContext}
              onAnalyze={() => analyze()}
              onAnalyzeImage={analyze}
              onSave={() => persistLibraryEntry(code)}
            />
          </div>

          <div className="relative min-h-0 bg-[color:var(--background)]">
            {!leftOpen ? (
              <button
                type="button"
                aria-label="Open controls"
                onClick={() => setLeftOpen(true)}
                className="control absolute left-3 top-3 z-20 grid h-10 w-10 place-items-center"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : null}
            {!rightOpen ? (
              <button
                type="button"
                aria-label="Open code panel"
                onClick={() => setRightOpen(true)}
                className="control absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            ) : null}

            <CanvasErrorBoundary>
              <FlowCanvas
                selectedShape={selectedShape}
                shapes={shapes}
                connections={connections}
                snapshot={initialSnapshot}
                activeTraceShapeId={activeTraceShapeId}
                onShapesChange={setShapes}
                onConnectionsChange={setConnections}
                onSceneChange={handleSceneChange}
                onShapeComplete={() => { }}
                onExcalidrawAPI={handleExcalidrawAPI}
              />
            </CanvasErrorBoundary>
          </div>

          <div className="min-h-0 overflow-hidden border-l border-[color:var(--border)] bg-[color:var(--surface)]">
            <CodeErrorBoundary>
              <CodePanel
                code={code}
                language={language}
                title={workspaceTitle}
                contextLabel={effectiveContext}
                isStreaming={isStreaming}
                analysis={analysis}
                onCopy={() => navigator.clipboard.writeText(code)}
                onPublish={publish}
                isPublishing={isPublishing}
              />
            </CodeErrorBoundary>
          </div>
        </div>

        <div className="flex min-h-9 items-center justify-between border-t border-[color:var(--border)] bg-[color:var(--surface-glass)] px-3 text-xs text-[color:var(--text-muted)] backdrop-blur-xl">
          <span className="inline-flex items-center gap-2">
            <Braces className="h-3.5 w-3.5 text-[color:var(--accent)]" />
            {language}
          </span>
          <span className="hidden sm:inline">{shapes.length} board objects · {code.length} code chars</span>
          <button type="button" onClick={() => void publish()} className="inline-flex items-center gap-1 text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]">
            <Share2 className="h-3.5 w-3.5" />
            {isPublishing ? "Publishing" : "Publish"}
          </button>
        </div>
      </div>
    </section>
  );
}
