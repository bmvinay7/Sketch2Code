"use client";

import { Upload } from "lucide-react";
import { useRef } from "react";

const ACCEPTED_TYPES = "image/png,image/jpeg,image/webp";

interface UploadedImagePreviewProps {
  previewUrl?: string;
  threshold: number | null;
  onSelectFile: (file: File) => void;
}

export function UploadedImagePreview({ previewUrl, threshold, onSelectFile }: UploadedImagePreviewProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) onSelectFile(file);
  }

  return (
    <div
      className="relative flex min-w-0 flex-1 items-center justify-center bg-ink-0 p-10"
      style={{ height: "calc(100vh - 57px)" }}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onSelectFile(file);
          event.target.value = "";
        }}
      />
      {previewUrl ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-5">
          <div className="crosshair relative max-h-full max-w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Uploaded sketch preview"
              className="max-h-[calc(100vh-220px)] max-w-full border border-rule bg-ink-50 object-contain p-2"
            />
          </div>
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="border border-rule-strong bg-transparent px-4 py-2 font-mono text-[11px] uppercase tracking-cap text-paper-50 transition-colors hover:bg-paper-50 hover:text-ink-0"
            >
              replace image
            </button>
            {threshold !== null && (
              <p className="font-mono text-[10px] uppercase tracking-cap text-paper-300">
                <span>otsu binarisation · </span>
                <span className="tabular text-amber">t = {threshold}</span>
              </p>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="group crosshair flex h-full max-h-[640px] w-full max-w-3xl flex-col items-center justify-center gap-5 border border-dashed border-rule-strong bg-ink-50/40 transition-colors hover:border-lime"
        >
          <div className="flex h-16 w-16 items-center justify-center border border-rule-strong">
            <Upload className="h-6 w-6 text-paper-200 transition-colors group-hover:text-lime" />
          </div>
          <div className="text-center">
            <p className="mono-headline text-[28px] text-paper-50">drop a sketch.</p>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-cap text-paper-300">
              png · jpg · webp · max 1280px
            </p>
          </div>
          <p className="mt-2 max-w-sm text-center text-[13px] leading-relaxed text-paper-100">
            We&apos;ll preprocess with Otsu&apos;s method, then ask Gemini to translate exactly what we see.
          </p>
        </button>
      )}
    </div>
  );
}
