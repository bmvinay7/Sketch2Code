"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Copy, Loader2, Play, Save, Share2, Upload } from "lucide-react";
import { buildCanvasSnapshot, generateSmartTitle, inferProblemContext, normalizeCanvasSnapshot } from "@/lib/flowcharts";
import type { CanvasConnection, CanvasSceneSnapshot, CodeLanguage, FlowShape, ShapeType } from "@/types/canvas";
import { CanvasErrorBoundary } from "@/components/canvas/CanvasErrorBoundary";
import { CodePanel } from "@/components/code/CodePanel";
import { LanguageSelector } from "@/components/code/LanguageSelector";
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

export function CanvasWorkspace({ sessionId, canPersist = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) }: { sessionId: string; canPersist?: boolean }) {
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
  const [isRefining, setIsRefining] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);
  const speculativeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAutoSavedRef = useRef("");
  const restoringRef = useRef(true);
  const lastSpeculativeCountRef = useRef(0);

  const inferredContext = useMemo(() => inferProblemContext(snapshot), [snapshot]);
  const effectiveContext = problemContext.trim() || inferredContext;
  const hasContent = shapes.length > 0 || (snapshot?.sceneElements.length ?? 0) > 0;
  const workspaceTitle = title || generateSmartTitle(effectiveContext, code, language);

  useEffect(() => {
    let cancelled = false;

    async function loadSavedSession() {
      if (!canPersist) {
        restoringRef.current = false;
        return;
      }

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
      } finally {
        if (!cancelled) restoringRef.current = false;
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

  useEffect(() => () => {
    if (speculativeTimerRef.current) clearTimeout(speculativeTimerRef.current);
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
  }, []);

  useEffect(() => {
    if (!canPersist || restoringRef.current || !snapshot || !hasContent || isStreaming) return;

    const signature = JSON.stringify({
      elements: snapshot.sceneElements,
      problemContext,
      language,
      title
    });

    if (signature === lastAutoSavedRef.current) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);

    autoSaveTimerRef.current = setTimeout(() => {
      lastAutoSavedRef.current = signature;
      void persistLibraryEntry(code, { silent: true });
    }, 1200);
  }, [canPersist, code, hasContent, isStreaming, language, problemContext, snapshot, title]);

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
      lastAutoSavedRef.current = JSON.stringify({
        elements: currentSnapshot.sceneElements,
        problemContext,
        language,
        title: generatedTitle
      });
      setSaveStatus("Saved");
    } finally {
      if (!options?.silent) setIsSaving(false);
    }
  }

  async function storeAnalysisSession(imageBase64: string) {
    await fetch("/api/canvas/analyse/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        language,
        problemContext: effectiveContext,
        imageBase64,
        snapshot: getCanvasSnapshot()
      })
    });
  }

  function streamGeneratedCode() {
    return new Promise<string>((resolve) => {
      const source = new EventSource(`/api/canvas/analyse/stream?sessionId=${encodeURIComponent(sessionId)}`);
      let nextCode = "";

      source.onmessage = (event) => {
        nextCode += event.data.replaceAll("\\n", "\n");
        setCode(nextCode);
      };

      source.addEventListener("cacheEnd", () => {
        setIsRefining(true);
      });

      source.addEventListener("done", () => {
        source.close();
        resolve(nextCode);
      });

      source.onerror = () => {
        source.close();
        resolve(nextCode || "// Error generating code from image.\n");
      };
    });
  }

  async function analyze(uploadedImageBase64?: string) {
    const imageBase64 = uploadedImageBase64 || (await getCanvasImageBase64());
    if (!imageBase64) {
      setAnalysis("Draw or upload a flowchart before generating.");
      return;
    }

    setIsStreaming(true);
    setIsRefining(false);
    setCode("");
    setAnalysis(undefined);
    setSaveStatus("Parsing board");

    let nextCode = "";

    try {
      await storeAnalysisSession(imageBase64);
      nextCode = await streamGeneratedCode();
    } catch {
      nextCode = "# Failed to generate code. Check the Gemini configuration.\n";
      setCode(nextCode);
    } finally {
      setIsStreaming(false);
      setIsRefining(false);
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
  const queueSpeculativeAnalysis = useCallback((nextSnapshot: CanvasSceneSnapshot) => {
    const elementCount = nextSnapshot.sceneElements.length;
    if (elementCount === 0 || elementCount % 2 !== 0 || elementCount === lastSpeculativeCountRef.current) return;

    lastSpeculativeCountRef.current = elementCount;
    if (speculativeTimerRef.current) clearTimeout(speculativeTimerRef.current);

    speculativeTimerRef.current = setTimeout(() => {
      void fetch("/api/canvas/analyse/speculative", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          language,
          problemContext: problemContext.trim() || inferProblemContext(nextSnapshot),
          snapshot: nextSnapshot
        })
      });
    }, 300);
  }, [language, problemContext, sessionId]);

  const handleSceneChange = useCallback((nextSnapshot: CanvasSceneSnapshot) => {
    setSnapshot(nextSnapshot);
    queueSpeculativeAnalysis(nextSnapshot);
  }, [queueSpeculativeAnalysis]);

  async function handleUploadImage(file: File | null) {
    if (!file) return;
    const imageBase64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
      reader.readAsDataURL(file);
    });
    await analyze(imageBase64);
  }

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
    <section className="min-h-[calc(100dvh-60px)] overflow-hidden bg-[color:var(--color-bg)] px-[clamp(14px,3vw,34px)] py-5">
      <div className="mx-auto flex max-w-[1480px] flex-col gap-4">
        <div className="rounded-[28px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-5 py-4 shadow-[0_24px_80px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="inline-flex items-center gap-2 rounded-full border border-[color:var(--color-border)] px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
                <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
                Canvas workspace
              </p>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                onBlur={() => setTitle((current) => current.trim())}
                placeholder="Untitled algorithm board"
                className="mt-4 block w-full border-none bg-transparent font-display text-[clamp(2.2rem,5vw,4.4rem)] font-bold leading-none text-[color:var(--color-text-primary)] outline-none placeholder:text-[color:var(--color-text-secondary)]"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3 lg:w-[520px]">
              {[
                ["Canvas", hasContent ? `${snapshot?.sceneElements.length ?? shapes.length} objects` : "Empty"],
                ["Status", isStreaming ? (isRefining ? "Refining" : "Streaming") : saveStatus],
                ["Library", canPersist ? "Autosave on" : "Sign-in gated"]
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-4 py-3">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[color:var(--color-text-secondary)]">{label}</p>
                  <p className="mt-2 text-sm font-semibold text-[color:var(--color-text-primary)]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid min-h-[680px] gap-4 xl:grid-cols-[300px_minmax(520px,1fr)_400px]">
          <aside className="rounded-[28px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-5">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-text-secondary)]">Workspace controls</p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-[color:var(--color-text-primary)]">
              Board to code
            </h2>

            <div className="mt-7 space-y-5">
              <label className="block">
                <span className="mb-2 block font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[color:var(--color-text-secondary)]">Language</span>
                <LanguageSelector value={language} onChange={setLanguage} />
              </label>

              <label className="block">
                <span className="mb-2 block font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[color:var(--color-text-secondary)]">Problem context</span>
                <textarea
                  value={problemContext}
                  onChange={(event) => setProblemContext(event.target.value)}
                  placeholder="Optional context for the algorithm"
                  className="min-h-[190px] w-full resize-none rounded-2xl border border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-4 py-4 text-sm leading-7 text-[color:var(--color-text-primary)] outline-none placeholder:text-[color:var(--color-text-secondary)] focus:border-[color:var(--color-accent)]"
                />
              </label>

              <div className="grid gap-2">
                <button
                  type="button"
                  onClick={() => void analyze()}
                  disabled={!hasContent || isStreaming}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[color:var(--color-accent)] px-4 text-sm font-semibold text-[color:var(--color-text-on-dark)] hover:bg-[color:var(--color-accent-hover)] disabled:opacity-50"
                >
                  {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} /> : <Play className="h-4 w-4" strokeWidth={1.5} />}
                  Analyse canvas
                </button>
                <button
                  type="button"
                  onClick={() => void persistLibraryEntry(code)}
                  disabled={isSaving}
                  className="control inline-flex h-11 items-center justify-center gap-2 px-4 text-sm font-semibold"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} /> : <Save className="h-4 w-4" strokeWidth={1.5} />}
                  Save to profile
                </button>
                <button
                  type="button"
                  onClick={() => uploadInputRef.current?.click()}
                  className="control inline-flex h-11 items-center justify-center gap-2 px-4 text-sm font-semibold"
                >
                  <Upload className="h-4 w-4" strokeWidth={1.5} />
                  Upload image
                </button>
                <input
                  ref={uploadInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(event) => void handleUploadImage(event.target.files?.[0] ?? null)}
                />
              </div>
            </div>
          </aside>

          <div className="overflow-hidden rounded-[28px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
            <div className="flex min-h-[76px] items-center justify-between gap-3 border-b border-[color:var(--color-border)] px-5">
              <div>
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-[color:var(--color-text-secondary)]">Board</p>
                <p className="mt-1 text-sm font-semibold text-[color:var(--color-text-primary)]">Excalidraw algorithm sketch</p>
              </div>
              <span className={cn("rounded-full border px-3 py-2 text-xs font-semibold", hasContent ? "border-[color:var(--color-accent)] text-[color:var(--color-accent)]" : "border-[color:var(--color-border)] text-[color:var(--color-text-secondary)]")}>
                {hasContent ? "Board active" : "Empty board"}
              </span>
            </div>
            <div className="h-[604px] min-h-0">
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
          </div>

          <div className="min-h-[680px] overflow-hidden rounded-[28px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
            <CodeErrorBoundary>
              <CodePanel
                code={code}
                language={language}
                title={workspaceTitle}
                contextLabel={effectiveContext}
                isStreaming={isStreaming}
                isRefining={isRefining}
                analysis={analysis}
                onCopy={() => navigator.clipboard.writeText(code)}
                onPublish={publish}
                isPublishing={isPublishing}
              />
            </CodeErrorBoundary>
          </div>
        </div>

        <div className="flex min-h-9 items-center justify-between px-2 text-xs text-[color:var(--color-text-secondary)]">
          <span>{language} · {shapes.length} board objects · {code.length} code chars</span>
          <button type="button" onClick={() => void publish()} className="inline-flex items-center gap-1 rounded-full px-3 py-2 hover:bg-[color:var(--color-surface)] hover:text-[color:var(--color-text-primary)]">
            <Share2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            {isPublishing ? "Publishing" : "Publish"}
          </button>
        </div>
      </div>
    </section>
  );
}
