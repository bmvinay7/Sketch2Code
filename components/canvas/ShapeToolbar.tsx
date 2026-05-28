"use client";

import { useRef } from "react";
import { ImageIcon, Pencil, Share2, Terminal, Upload, X } from "lucide-react";
import type { CodeLanguage } from "@/types/canvas";
import { cn } from "@/lib/utils";

const languages: Array<{ label: string; value: CodeLanguage; ext: string }> = [
  { label: "python", value: "python", ext: ".py" },
  { label: "java", value: "java", ext: ".java" },
  { label: "c++", value: "cpp", ext: ".cpp" }
];

const ACCEPTED_TYPES = "image/png,image/jpeg,image/webp";

export type ImageSource = "canvas" | "upload";

interface ShapeToolbarProps {
  language: CodeLanguage;
  problemContext: string;
  canAnalyze: boolean;
  canPublish: boolean;
  isBusy: boolean;
  imageSource: ImageSource;
  uploadedPreview?: string;
  otsuThreshold: number | null;
  onLanguageChange: (language: CodeLanguage) => void;
  onContextChange: (value: string) => void;
  onAnalyze: () => void;
  onPublish: () => void;
  onClearDraft?: () => void;
  onImageSourceChange: (source: ImageSource) => void;
  onImageUpload: (file: File) => void | Promise<void>;
  onClearUpload: () => void;
}

export function ShapeToolbar(props: ShapeToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFile(file: File | undefined) {
    if (!file) return;
    void props.onImageUpload(file);
  }

  return (
    <aside className="flex w-full flex-col overflow-y-auto border-r border-rule bg-ink-0 lg:h-[calc(100vh-57px)] lg:w-72">
      {/* Section: source */}
      <Section label="01 / source">
        <div className="grid grid-cols-2 gap-px bg-rule">
          <SegmentButton
            active={props.imageSource === "canvas"}
            onClick={() => props.onImageSourceChange("canvas")}
            icon={<Pencil className="h-3 w-3" />}
            label="draw"
          />
          <SegmentButton
            active={props.imageSource === "upload"}
            onClick={() => props.onImageSourceChange("upload")}
            icon={<ImageIcon className="h-3 w-3" />}
            label="upload"
          />
        </div>

        {props.imageSource === "upload" && (
          <div className="mt-4">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                handleFile(file);
                event.target.value = "";
              }}
            />
            {props.uploadedPreview ? (
              <div className="relative border border-rule bg-ink-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={props.uploadedPreview}
                  alt="Uploaded sketch"
                  className="block h-28 w-full object-contain"
                />
                <button
                  type="button"
                  onClick={props.onClearUpload}
                  className="absolute right-1.5 top-1.5 border border-rule-strong bg-ink-0/80 p-1 text-paper-200 transition hover:text-paper-50"
                  aria-label="Remove uploaded image"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 border border-dashed border-rule-strong bg-ink-50 px-3 py-6 text-paper-200 transition hover:border-lime hover:text-paper-50"
              >
                <Upload className="h-4 w-4" />
                <span className="font-mono text-[11px] uppercase tracking-cap">drop or click</span>
                <span className="font-mono text-[10px] uppercase tracking-cap text-paper-300">png · jpg · webp</span>
              </button>
            )}
            {props.uploadedPreview && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3 font-mono text-[11px] uppercase tracking-cap text-paper-200 hover:text-lime"
              >
                replace image →
              </button>
            )}
          </div>
        )}
      </Section>

      {/* Section: language */}
      <Section label="02 / language">
        <div className="grid gap-px bg-rule">
          {languages.map((item) => (
            <button
              key={item.value}
              onClick={() => props.onLanguageChange(item.value)}
              className={cn(
                "flex items-center justify-between bg-ink-0 px-4 py-3 font-mono text-[12px] uppercase tracking-cap transition-colors",
                props.language === item.value
                  ? "text-paper-50"
                  : "text-paper-200 hover:bg-ink-50 hover:text-paper-50"
              )}
            >
              <span className="flex items-center gap-3">
                <span className={cn("tabular text-[10px]", props.language === item.value ? "text-lime" : "text-paper-300")}>
                  {props.language === item.value ? "●" : "○"}
                </span>
                {item.label}
              </span>
              <span className="font-mono text-[10px] text-paper-300">{item.ext}</span>
            </button>
          ))}
        </div>
      </Section>

      {/* Section: context */}
      <Section label="03 / problem context">
        <textarea
          value={props.problemContext}
          onChange={(event) => props.onContextChange(event.target.value)}
          placeholder="what problem are you solving?"
          className="min-h-[112px] w-full resize-none border border-rule bg-ink-50 p-3 font-mono text-[12px] leading-relaxed text-paper-50 outline-none transition placeholder:text-paper-300 focus:border-rule-strong"
        />
      </Section>

      {/* Action stack */}
      <div className="mt-auto border-t border-rule p-5">
        <button
          onClick={props.onAnalyze}
          disabled={!props.canAnalyze || props.isBusy}
          className="group inline-flex h-12 w-full items-center justify-between border border-lime bg-lime px-4 font-mono text-[12px] uppercase tracking-cap text-ink-0 transition-colors hover:bg-paper-50 hover:border-paper-50 disabled:cursor-not-allowed disabled:border-graphite disabled:bg-graphite disabled:text-paper-300"
        >
          <span className="flex items-center gap-3">
            <Terminal className="h-3.5 w-3.5" />
            {props.imageSource === "upload" ? "analyze sketch" : "analyze canvas"}
          </span>
          <span className="tabular text-[10px] text-ink-0/60 group-disabled:text-paper-300">⏎</span>
        </button>

        <button
          onClick={props.onPublish}
          disabled={!props.canPublish}
          className="mt-3 inline-flex h-12 w-full items-center justify-between border border-rule-strong bg-transparent px-4 font-mono text-[12px] uppercase tracking-cap text-paper-50 transition-colors hover:bg-paper-50 hover:text-ink-0 disabled:cursor-not-allowed disabled:border-rule disabled:text-paper-300"
        >
          <span className="flex items-center gap-3">
            <Share2 className="h-3.5 w-3.5" />
            publish
          </span>
          <span className="tabular text-[10px] text-paper-300">→</span>
        </button>

        {props.otsuThreshold !== null && (
          <p className="mt-5 flex items-center justify-between font-mono text-[10px] uppercase tracking-cap text-paper-300">
            <span>otsu binarised</span>
            <span className="tabular text-amber">t = {props.otsuThreshold}</span>
          </p>
        )}

        {props.onClearDraft && (
          <button
            type="button"
            onClick={props.onClearDraft}
            className="mt-4 w-full text-left font-mono text-[10px] uppercase tracking-cap text-paper-300 transition-colors hover:text-crimson"
          >
            clear saved draft ↺
          </button>
        )}
      </div>
    </aside>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-rule p-5">
      <p className="eyebrow">{label}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function SegmentButton({
  active,
  onClick,
  icon,
  label
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center gap-2 px-3 py-3 font-mono text-[11px] uppercase tracking-cap transition-colors",
        active
          ? "bg-paper-50 text-ink-0"
          : "bg-ink-0 text-paper-200 hover:bg-ink-50 hover:text-paper-50"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
