import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not synced" }, { status: 409 });
  const existing = await prisma.save.findUnique({
    where: { userId_postId: { userId: user.id, postId: params.id } }
  });
  if (existing) {
    await prisma.save.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  }
  await prisma.save.create({ data: { userId: user.id, postId: params.id } });
  return NextResponse.json({ saved: true });
}
