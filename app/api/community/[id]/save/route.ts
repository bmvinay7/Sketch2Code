import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveWriter } from "@/lib/currentUser";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const writer = await resolveWriter();
  if (!writer.ok) return NextResponse.json({ error: writer.error }, { status: writer.status });
  try {
    const existing = await prisma.save.findUnique({
      where: { userId_postId: { userId: writer.user.id, postId: id } }
    });
    if (existing) {
      await prisma.save.delete({ where: { id: existing.id } });
      return NextResponse.json({ saved: false });
    }
    await prisma.save.create({ data: { userId: writer.user.id, postId: id } });
    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error("[community.save]", error);
    return NextResponse.json({ error: "Could not toggle save." }, { status: 500 });
  }
}
