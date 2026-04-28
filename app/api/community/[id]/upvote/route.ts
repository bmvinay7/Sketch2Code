import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const post = await prisma.communityPost.update({
    where: { id: params.id },
    data: { upvotes: { increment: 1 } }
  });
  return NextResponse.json({ post });
}
