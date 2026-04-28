import { CanvasWorkspace } from "@/components/canvas/CanvasWorkspace";

export default function CanvasPage({ params }: { params: { id: string } }) {
  return <CanvasWorkspace sessionId={params.id === "new" ? crypto.randomUUID() : params.id} />;
}
