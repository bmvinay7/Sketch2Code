import { CanvasWorkspace } from "@/components/canvas/CanvasWorkspace";

export default function CanvasPage({ params }: { params: { id: string } }) {
  const canPersist = Boolean(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
      process.env.CLERK_SECRET_KEY &&
      process.env.DISABLE_AUTH !== "true"
  );

  return <CanvasWorkspace sessionId={params.id === "new" ? crypto.randomUUID() : params.id} canPersist={canPersist} />;
}
