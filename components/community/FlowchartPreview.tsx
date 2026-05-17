"use client";

import { ExcalidrawEmbed } from "@/components/canvas/ExcalidrawEmbed";

function heightFromClass(heightClass: string) {
  const match = heightClass.match(/h-\[(.+)\]/);
  return match?.[1] ?? "420px";
}

export function FlowchartPreview({ snapshot, heightClass = "h-[420px]" }: { snapshot: unknown; heightClass?: string }) {
  return <ExcalidrawEmbed scene={snapshot} height={heightFromClass(heightClass)} className="pointer-events-none" />;
}
