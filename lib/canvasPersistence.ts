/**
 * Per-tab persistence for the canvas draft.
 *
 * Stored under a single localStorage key (not sessionStorage — survives tab
 * close and browser restart, which is what "I don't want to redraw" implies).
 * One slot, not keyed by sessionId: the canvas URL is /canvas/new which
 * regenerates a UUID on every visit, so the slot is "last unsaved draft."
 *
 * If the schema below ever changes shape, bump STORAGE_VERSION — old payloads
 * fail the version check and are discarded silently.
 */

import type { ImageSource } from "@/components/canvas/ShapeToolbar";
import type { CodeLanguage } from "@/types/canvas";

const STORAGE_KEY = "sketch2code:canvas:draft";
const STORAGE_VERSION = 1;

export interface PersistedUploadedImage {
  base64: string;
  previewDataUrl: string;
  threshold: number;
}

export interface PersistedScene {
  elements: unknown[];
  appState: Record<string, unknown>;
  files: Record<string, unknown>;
}

export interface PersistedCanvasState {
  language: CodeLanguage;
  problemContext: string;
  imageSource: ImageSource;
  uploadedImage: PersistedUploadedImage | null;
  scene: PersistedScene | null;
  code: string;
  analysis: string | null;
}

interface Envelope {
  v: number;
  savedAt: number;
  state: PersistedCanvasState;
}

export function loadCanvasDraft(): PersistedCanvasState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const env = JSON.parse(raw) as Envelope;
    if (env.v !== STORAGE_VERSION || !env.state) return null;
    return env.state;
  } catch {
    return null;
  }
}

export function saveCanvasDraft(state: PersistedCanvasState): void {
  if (typeof window === "undefined") return;
  try {
    const env: Envelope = { v: STORAGE_VERSION, savedAt: Date.now(), state };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(env));
  } catch (error) {
    // Quota exceeded (large scene + base64). Drop the heaviest field and retry.
    if (state.uploadedImage) {
      try {
        const trimmed: PersistedCanvasState = { ...state, uploadedImage: null };
        const env: Envelope = { v: STORAGE_VERSION, savedAt: Date.now(), state: trimmed };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(env));
        return;
      } catch {
        /* fall through */
      }
    }
    console.warn("[canvasPersistence] save failed", error);
  }
}

export function clearCanvasDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
