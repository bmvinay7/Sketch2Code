import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { requireDatabaseUser } from "@/lib/auth-user";
import { createComment, listComments } from "@/lib/community-comments";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const comments = await listComments(params.id);
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

  const comment = await createComment(params.id, user.id, bodyText);

  return NextResponse.json({ comment });
}
