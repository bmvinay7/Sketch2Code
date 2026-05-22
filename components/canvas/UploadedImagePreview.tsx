"use client";

import { ImageIcon, Upload } from "lucide-react";
import { useRef } from "react";

const ACCEPTED_TYPES = "image/png,image/jpeg,image/webp";

interface UploadedImagePreviewProps {
  previewUrl?: string;
  onSelectFile: (file: File) => void;
}

export function UploadedImagePreview({ previewUrl, onSelectFile }: UploadedImagePreviewProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) onSelectFile(file);
  }

  return (
    <div
      className="flex-1 relative min-w-0 mt-16 flex items-center justify-center bg-[#08080d] p-8"
      style={{ height: "calc(100vh - 4rem)" }}
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
        <div className="flex h-full w-full flex-col items-center justify-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Uploaded sketch preview"
            className="max-h-full max-w-full rounded-xl border border-white/10 bg-black/40 object-contain shadow-lg"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-md border border-white/10 bg-black/40 px-4 py-2 text-xs font-medium text-text-secondary transition hover:bg-white/5 hover:text-text-primary"
          >
            Replace image
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-full max-h-[640px] w-full max-w-3xl flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-white/10 bg-black/30 text-text-secondary transition hover:border-accent/60 hover:bg-white/5 hover:text-text-primary"
        >
          <div className="flex items-center gap-3">
            <ImageIcon className="h-8 w-8" />
            <Upload className="h-8 w-8" />
          </div>
          <p className="text-base font-semibold">Drop a sketch here</p>
          <p className="text-xs text-text-muted">or click to browse PNG, JPG or WebP files</p>
        </button>
      )}
    </div>
  );
}
