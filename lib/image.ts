import { otsuBinarizeCanvas } from "@/lib/otsu";

const MAX_DIMENSION = 1280;

export interface PreparedImage {
  /** Base64 (no data: prefix) of the Otsu-binarised PNG actually sent to Gemini. */
  base64: string;
  /** Data URL of the user-visible preview (resized but NOT binarised, so the user sees their drawing as-is). */
  previewDataUrl: string;
  /** Otsu threshold the algorithm picked, in [0, 255]. */
  threshold: number;
}

async function readFileAsDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to decode image"));
    img.src = src;
  });
}

function drawScaled(image: HTMLImageElement): HTMLCanvasElement {
  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
  const w = Math.max(1, Math.round(image.width * scale));
  const h = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(image, 0, 0, w, h);
  return canvas;
}

/**
 * Take a user-supplied file (PNG/JPG/WebP), downscale it to fit
 * MAX_DIMENSION, return the colour preview AND an Otsu-binarised PNG
 * suitable for upload. The binarisation step strips paper texture and
 * lighting gradients so the vision model sees clean strokes.
 */
export async function prepareImageFromFile(file: File): Promise<PreparedImage> {
  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);
  const previewCanvas = drawScaled(image);
  const previewDataUrl = previewCanvas.toDataURL("image/png");

  // Run Otsu on a separate canvas so the preview keeps the user's colours.
  const workCanvas = document.createElement("canvas");
  workCanvas.width = previewCanvas.width;
  workCanvas.height = previewCanvas.height;
  const workCtx = workCanvas.getContext("2d");
  if (!workCtx) throw new Error("Canvas 2D context unavailable");
  workCtx.drawImage(previewCanvas, 0, 0);
  const threshold = otsuBinarizeCanvas(workCanvas);
  const base64 = workCanvas.toDataURL("image/png").split(",")[1] ?? "";

  return { base64, previewDataUrl, threshold };
}

/**
 * Same pipeline starting from a Blob (used for the Excalidraw export
 * path, which already produces a clean PNG but is fed through Otsu for
 * consistency).
 */
export async function prepareImageFromBlob(blob: Blob): Promise<PreparedImage> {
  const dataUrl = await readFileAsDataUrl(blob);
  const image = await loadImage(dataUrl);
  const previewCanvas = drawScaled(image);
  const previewDataUrl = previewCanvas.toDataURL("image/png");

  const workCanvas = document.createElement("canvas");
  workCanvas.width = previewCanvas.width;
  workCanvas.height = previewCanvas.height;
  const workCtx = workCanvas.getContext("2d");
  if (!workCtx) throw new Error("Canvas 2D context unavailable");
  workCtx.drawImage(previewCanvas, 0, 0);
  const threshold = otsuBinarizeCanvas(workCanvas);
  const base64 = workCanvas.toDataURL("image/png").split(",")[1] ?? "";

  return { base64, previewDataUrl, threshold };
}
