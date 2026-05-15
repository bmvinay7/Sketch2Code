import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { requireDatabaseUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  const body = await request.json();
  const value = body.value as number; // 1 or -1
  if (value !== 1 && value !== -1) return NextResponse.json({ error: "Invalid vote value" }, { status: 400 });

  const user = await requireDatabaseUser(userId);
  if (!user) return NextResponse.json({ error: "User not synced" }, { status: 409 });

  const postId = params.id;

  const existingVote = await prisma.postVote.findUnique({
    where: { userId_postId: { userId: user.id, postId } }
  });

  if (existingVote) {
    if (existingVote.value === value) {
      // Toggle off
      await prisma.postVote.delete({ where: { id: existingVote.id } });
      await prisma.communityPost.update({
        where: { id: postId },
        data: { upvotes: { decrement: value } }
      });
      return NextResponse.json({ success: true, message: "Vote removed" });
    } else {
      // Change vote
      await prisma.postVote.update({
        where: { id: existingVote.id },
        data: { value }
      });
      await prisma.communityPost.update({
        where: { id: postId },
        data: { upvotes: { increment: value * 2 } } // from -1 to 1 is +2
      });
      return NextResponse.json({ success: true, message: "Vote changed" });
    }
  } else {
    // New vote
    await prisma.postVote.create({
      data: { userId: user.id, postId, value }
    });
    await prisma.communityPost.update({
      where: { id: postId },
      data: { upvotes: { increment: value } }
    });
    return NextResponse.json({ success: true, message: "Vote added" });
  }
}
