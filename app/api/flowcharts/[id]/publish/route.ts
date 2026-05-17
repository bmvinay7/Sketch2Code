import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { requireDatabaseUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await requireDatabaseUser(userId);
  if (!user) return NextResponse.json({ error: "User not synced" }, { status: 409 });

  const flowchart = await prisma.flowchart.findUnique({
    where: { id: params.id },
    include: { communityPost: true }
  });

  if (!flowchart) {
    return NextResponse.json({ error: "Flowchart not found" }, { status: 404 });
  }

  if (flowchart.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (flowchart.isPublished && flowchart.communityPost) {
    return NextResponse.json({ message: "Already published" });
  }

  await prisma.$transaction([
    prisma.flowchart.update({
      where: { id: flowchart.id },
      data: { isPublished: true }
    }),
    prisma.communityPost.create({
      data: {
        userId: user.id,
        flowchartId: flowchart.id,
        tags: []
      }
    })
  ]);

  return NextResponse.json({ message: "Published successfully" });
}
