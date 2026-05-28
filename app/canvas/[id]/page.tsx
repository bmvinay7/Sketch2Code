import { CanvasWorkspace } from "@/components/canvas/CanvasWorkspace";

export default async function CanvasPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CanvasWorkspace sessionId={id === "new" ? crypto.randomUUID() : id} />;
}
