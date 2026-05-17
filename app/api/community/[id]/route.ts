import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { requireDatabaseUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await requireDatabaseUser(userId);
  if (!user) return NextResponse.json({ error: "User not synced" }, { status: 409 });

  const post = await prisma.communityPost.findUnique({
    where: { id: params.id },
    include: { flowchart: true }
  });

  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (post.flowchart.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.$transaction([
    prisma.communityPost.delete({ where: { id: params.id } }),
    prisma.flowchart.update({ where: { id: post.flowchartId }, data: { isPublished: false } })
  ]);

  return NextResponse.json({ ok: true });
}
