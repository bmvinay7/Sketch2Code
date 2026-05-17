import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { requireDatabaseUser } from "@/lib/auth-user";
import { togglePostVote } from "@/lib/community-votes";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const body = await request.json();
  const value = body.value as number; // 1 or -1
  if (value !== 1 && value !== -1) return NextResponse.json({ error: "Invalid vote value" }, { status: 400 });

  const user = await requireDatabaseUser(userId);
  if (!user) return NextResponse.json({ error: "User not synced" }, { status: 409 });

  const result = await togglePostVote(params.id, user.id, value);
  return NextResponse.json({ success: true, ...result });
}
