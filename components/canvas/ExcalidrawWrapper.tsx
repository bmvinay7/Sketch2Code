"use client";

import { Excalidraw } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";
import { useCallback, useEffect, useRef } from "react";
import { useTheme } from "@/components/theme/ThemeProvider";

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

interface ExcalidrawWrapperProps {
  initialData?: unknown;
  onExcalidrawAPI?: (api: ExcalidrawHandle | null) => void;
  onSceneChange?: (data: { elements: any; appState: any; files: any }) => void;
}

export default function ExcalidrawWrapper({ initialData, onExcalidrawAPI, onSceneChange }: ExcalidrawWrapperProps) {
  const onSceneChangeRef = useRef(onSceneChange);
  const apiSetRef = useRef(false);
  const { theme } = useTheme();

  useEffect(() => {
    onSceneChangeRef.current = onSceneChange;
  }, [onSceneChange]);

  const handleChange = useCallback((elements: any, appState: any, files: any) => {
    onSceneChangeRef.current?.({ elements, appState, files });
  }, []);

  const handleAPI = useCallback((api: any) => {
    if (!apiSetRef.current) {
      apiSetRef.current = true;
      onExcalidrawAPI?.(api as ExcalidrawHandle);
    }
  }, [onExcalidrawAPI]);

  return (
    <div className="h-full min-h-0 w-full touch-none [&_.excalidraw]:h-full [&_.excalidraw]:bg-transparent [&_.excalidraw__canvas]:bg-transparent [&_.excalidraw__canvas]:pointer-events-auto">
      <Excalidraw
        excalidrawAPI={handleAPI}
        theme={theme}
        initialData={initialData as any}
        autoFocus
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
        onChange={handleChange}
      />
    </div>
  );
}
