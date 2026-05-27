import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveWriter } from "@/lib/currentUser";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const writer = await resolveWriter();
  if (!writer.ok) return NextResponse.json({ error: writer.error }, { status: writer.status });
  try {
    const post = await prisma.communityPost.update({
      where: { id: params.id },
      data: { upvotes: { increment: 1 } }
    });
    return NextResponse.json({ post });
  } catch (error) {
    console.error("[community.upvote]", error);
    return NextResponse.json({ error: "Could not record upvote." }, { status: 500 });
  }
}
