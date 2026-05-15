import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { requireDatabaseUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const comments = await prisma.comment.findMany({
    where: { postId: params.id },
    include: { user: { select: { name: true, avatar: true } } },
    orderBy: { createdAt: "asc" }
  });
  return NextResponse.json({ comments });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const reqBody = await request.json();
  const bodyText = reqBody.body as string;
  if (!bodyText || bodyText.trim().length === 0) {
    return NextResponse.json({ error: "Comment cannot be empty" }, { status: 400 });
  }

  const user = await requireDatabaseUser(userId);
  if (!user) return NextResponse.json({ error: "User not synced" }, { status: 409 });

  const comment = await prisma.comment.create({
    data: {
      body: bodyText,
      postId: params.id,
      userId: user.id
    },
    include: { user: { select: { name: true, avatar: true } } }
  });

  return NextResponse.json({ comment });
}
