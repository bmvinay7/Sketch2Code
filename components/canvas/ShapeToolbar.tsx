"use client";

import { useRef } from "react";
import { GitBranch, ImageIcon, Pencil, Terminal, Upload, X } from "lucide-react";
import type { CodeLanguage } from "@/types/canvas";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const languages: Array<{ label: string; value: CodeLanguage }> = [
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" }
];

const MAX_DIMENSION = 1280;
const ACCEPTED_TYPES = "image/png,image/jpeg,image/webp";

export type ImageSource = "canvas" | "upload";

interface ShapeToolbarProps {
  language: CodeLanguage;
  problemContext: string;
  canAnalyze: boolean;
  isBusy: boolean;
  imageSource: ImageSource;
  uploadedPreview?: string;
  onLanguageChange: (language: CodeLanguage) => void;
  onContextChange: (value: string) => void;
  onAnalyze: () => void;
  onImageSourceChange: (source: ImageSource) => void;
  onImageUpload: (base64: string, previewDataUrl: string) => void;
  onClearUpload: () => void;
}

async function fileToBase64Png(file: File): Promise<{ base64: string; dataUrl: string }> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

  // Downscale via an offscreen canvas so the backend payload stays small
  // and we always send PNG (matching the mime type the backend forwards to Gemini).
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

export function ShapeToolbar(props: ShapeToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    try {
      const { base64, dataUrl } = await fileToBase64Png(file);
      props.onImageUpload(base64, dataUrl);
    } catch (error) {
      console.error("Failed to process uploaded image", error);
    }
  }

  return (
    <aside className="flex h-[calc(100svh-4rem)] mt-16 w-full flex-col border-r border-white/10 bg-[#08111f]/60 backdrop-blur-md p-6 lg:w-72 overflow-y-auto">
      <label className="text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">
        Sketch source
      </label>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => props.onImageSourceChange("canvas")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
            props.imageSource === "canvas"
              ? "bg-white/10 border-white/30 text-text-primary"
              : "bg-black/20 border-white/5 text-text-secondary hover:bg-white/5 hover:text-text-primary"
          )}
        >
          <Pencil className="h-3.5 w-3.5" />
          Draw
        </button>
        <button
          type="button"
          onClick={() => props.onImageSourceChange("upload")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors",
            props.imageSource === "upload"
              ? "bg-white/10 border-white/30 text-text-primary"
              : "bg-black/20 border-white/5 text-text-secondary hover:bg-white/5 hover:text-text-primary"
          )}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          Upload
        </button>
      </div>

      {props.imageSource === "upload" && (
        <div className="mt-4 flex flex-col gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              void handleFile(file);
              event.target.value = "";
            }}
          />
          {props.uploadedPreview ? (
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={props.uploadedPreview}
                alt="Uploaded sketch"
                className="block h-32 w-full object-contain"
              />
              <button
                type="button"
                onClick={props.onClearUpload}
                className="absolute right-2 top-2 rounded-full bg-black/70 p-1 text-text-secondary transition hover:bg-black/90 hover:text-text-primary"
                aria-label="Remove uploaded image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 bg-black/30 px-3 py-6 text-xs text-text-secondary transition hover:border-accent/60 hover:bg-white/5 hover:text-text-primary"
            >
              <Upload className="h-5 w-5" />
              <span className="font-medium">Drop or click to upload</span>
              <span className="text-[0.7rem] text-text-muted">PNG, JPG or WebP</span>
            </button>
          )}
          {props.uploadedPreview && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-medium text-accent transition hover:text-accent/80"
            >
              Replace image
            </button>
          )}
        </div>
      )}

      <label className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">
        Language
      </label>
      <div className="mt-4 flex flex-col gap-2">
        {languages.map((item) => (
          <button
            key={item.value}
            className={cn(
              "rounded-lg px-4 py-3 text-sm font-medium transition-colors text-left border",
              props.language === item.value
                ? "bg-white/10 border-white/30 text-text-primary"
                : "bg-black/20 border-white/5 text-text-secondary hover:bg-white/5 hover:text-text-primary"
            )}
            onClick={() => props.onLanguageChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <label className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-text-muted">
        Problem context
      </label>
      <textarea
        value={props.problemContext}
        onChange={(event) => props.onContextChange(event.target.value)}
        placeholder="What problem are you solving?"
        className="mt-4 min-h-[120px] resize-none rounded-xl border border-white/10 bg-black/40 p-4 font-body text-[0.95rem] text-text-primary outline-none transition placeholder:text-text-muted focus:border-accent focus:bg-white/5"
      />
      <div className="mt-auto space-y-4 pt-8">
        <Button onClick={props.onAnalyze} disabled={!props.canAnalyze || props.isBusy} className="w-full justify-center">
          <Terminal className="mr-2 inline h-4 w-4" />
          {props.imageSource === "upload" ? "Analyze Sketch" : "Analyze Canvas"}
        </Button>
        <div className="flex items-start gap-3 rounded-lg border border-white/5 bg-black/20 p-4 text-xs text-text-secondary leading-relaxed">
          <GitBranch className="h-4 w-4 shrink-0 text-accent mt-0.5" />
          <p>
            {props.imageSource === "upload"
              ? "Upload a photo of a hand-drawn flowchart and we'll generate code from it."
              : "Draw lines and connect elements with Excalidraw tools."}
          </p>
        </div>
      </div>
    </aside>
  );
}
