import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createComment, listComments } from "@/lib/community-comments";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const comments = await listComments(params.id);
  return NextResponse.json({ comments });
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not synced" }, { status: 409 });

  const body = (await request.json()) as { body?: string };
  const content = body.body?.trim();

  if (!content) {
    return NextResponse.json({ error: "Comment body is required" }, { status: 400 });
  }

  const comment = await createComment(params.id, user.id, content);
  if (!comment) return NextResponse.json({ error: "Comment could not be created" }, { status: 500 });

  return NextResponse.json({ comment }, { status: 201 });
}
