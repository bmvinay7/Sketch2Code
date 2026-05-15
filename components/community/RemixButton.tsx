"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Copy } from "lucide-react";

export function RemixButton({ flowchartId, canResumeSession }: { flowchartId: string; canResumeSession: boolean }) {
  const router = useRouter();
  const [isRemixing, setIsRemixing] = useState(false);

  async function handleRemix() {
    if (canResumeSession) {
      router.push(`/canvas/${flowchartId}`);
      return;
    }

    setIsRemixing(true);
    try {
      const res = await fetch("/api/flowcharts/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flowchartId })
      });
      const data = await res.json();
      if (res.ok && data.id) {
        router.push(`/canvas/${data.id}`);
      } else {
        alert("Failed to remix the flowchart. Please ensure you are logged in.");
      }
    } catch (e) {
      console.error(e);
      alert("An error occurred while remixing.");
    } finally {
      setIsRemixing(false);
    }
  }

  return (
    <button
      onClick={handleRemix}
      disabled={isRemixing}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-[color:var(--border-strong)] bg-[color:var(--surface-elevated)] px-4 py-3 text-sm font-semibold text-[color:var(--text-primary)] transition duration-200 hover:-translate-y-0.5 hover:bg-[color:var(--surface-hover)] disabled:opacity-50"
    >
      {isRemixing ? "Importing to Workspace..." : canResumeSession ? "Resume this session" : "Remix into your workspace"}
      {canResumeSession ? <ArrowRight className="h-4 w-4 text-[color:var(--accent)]" /> : <Copy className="h-4 w-4 text-[color:var(--accent)]" />}
    </button>
  );
}
