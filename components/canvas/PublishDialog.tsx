"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, X } from "lucide-react";
import type { CodeLanguage } from "@/types/canvas";

interface PublishDialogProps {
  defaultTitle: string;
  language: CodeLanguage;
  problemContext: string;
  generatedCode: string;
  onClose: () => void;
}

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string }
  | { kind: "success"; postId?: string };

export function PublishDialog(props: PublishDialogProps) {
  const router = useRouter();
  const [title, setTitle] = useState(props.defaultTitle);
  const [tagsText, setTagsText] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function submit() {
    if (!title.trim()) {
      setStatus({ kind: "error", message: "Please give your flowchart a title." });
      return;
    }
    setStatus({ kind: "submitting" });
    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const response = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          problem: props.problemContext || undefined,
          language: props.language,
          shapes: [],
          generatedCode: props.generatedCode,
          tags
        })
      });
      if (!response.ok) {
        const raw = await response.text();
        let payloadError: string | undefined;
        try {
          payloadError = (JSON.parse(raw) as { error?: string }).error;
        } catch {
          // Non-JSON body — fall through to a generic message with the status code.
        }
        if (response.status === 401) {
          setStatus({ kind: "error", message: payloadError ?? "Sign in to publish to the community." });
          return;
        }
        if (response.status === 409) {
          setStatus({ kind: "error", message: payloadError ?? "Your account hasn't synced from Clerk yet. Try again in a moment." });
          return;
        }
        setStatus({ kind: "error", message: payloadError ?? `Publish failed (HTTP ${response.status}). Check the server log.` });
        return;
      }
      const payload = (await response.json()) as { flowchart?: { communityPost?: { id?: string } } };
      setStatus({ kind: "success", postId: payload.flowchart?.communityPost?.id });
      router.refresh();
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "Network error while publishing."
      });
    }
  }

  function onBackdrop() {
    if (status.kind !== "submitting") props.onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-0/80 backdrop-blur-sm p-4"
      onClick={onBackdrop}
    >
      <div
        className="crosshair relative w-full max-w-md border border-rule-strong bg-ink-50"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-rule px-5 py-3.5">
          <div className="flex items-center gap-3">
            <span className="index-tag">publish</span>
            <span className="font-mono text-[12px] uppercase tracking-cap text-paper-50">
              to community
            </span>
          </div>
          <button
            type="button"
            onClick={props.onClose}
            className="border border-transparent p-1.5 text-paper-200 transition hover:border-rule-strong hover:text-paper-50"
            aria-label="Close"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </header>

        <div className="space-y-5 px-5 py-6">
          <Field label="title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className="h-11 w-full border border-rule bg-ink-0 px-3 font-mono text-[13px] text-paper-50 outline-none transition focus:border-rule-strong"
            />
          </Field>
          <Field label="tags · comma separated · optional">
            <input
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="dp, recursion, arrays"
              className="h-11 w-full border border-rule bg-ink-0 px-3 font-mono text-[13px] text-paper-50 outline-none transition placeholder:text-paper-300 focus:border-rule-strong"
            />
          </Field>

          {status.kind === "error" && (
            <p className="border-l-2 border-crimson bg-crimson/5 px-3 py-2 font-mono text-[11px] text-crimson">
              {status.message}
            </p>
          )}
          {status.kind === "success" && (
            <p className="border-l-2 border-lime bg-lime/5 px-3 py-2 font-mono text-[11px] text-lime">
              published. <a className="underline underline-offset-2 hover:text-paper-50" href="/community">view library →</a>
            </p>
          )}
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-rule px-5 py-4">
          <button
            type="button"
            onClick={props.onClose}
            className="px-3 py-2 font-mono text-[11px] uppercase tracking-cap text-paper-200 transition hover:text-paper-50"
          >
            cancel
          </button>
          <button
            onClick={submit}
            disabled={status.kind === "submitting" || status.kind === "success"}
            className="inline-flex h-10 items-center gap-2 border border-lime bg-lime px-4 font-mono text-[11px] uppercase tracking-cap text-ink-0 transition-colors hover:bg-paper-50 hover:border-paper-50 disabled:cursor-not-allowed disabled:border-graphite disabled:bg-graphite disabled:text-paper-300"
          >
            {status.kind === "submitting" ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" /> publishing
              </>
            ) : status.kind === "success" ? (
              "published"
            ) : (
              "publish →"
            )}
          </button>
        </footer>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow">{label}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
