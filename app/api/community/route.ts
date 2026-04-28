import { auth } from "@clerk/nextjs/server";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language");
  const q = searchParams.get("q");
  const posts = await prisma.communityPost.findMany({
    where: {
      flowchart: {
        language: language && language !== "All" ? language.toLowerCase() : undefined,
        title: q ? { contains: q, mode: "insensitive" } : undefined
      }
    },
    include: { flowchart: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
    take: 24
  });
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await request.json()) as {
    title: string;
    problem?: string;
    language: string;
    shapes: unknown;
    generatedCode: string;
    tags?: string[];
  };
  const user = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (!user) return NextResponse.json({ error: "User not synced" }, { status: 409 });
  const flowchart = await prisma.flowchart.create({
    data: {
      userId: user.id,
      title: body.title,
      problem: body.problem,
      language: body.language,
      shapes: body.shapes as Prisma.InputJsonValue,
      generatedCode: body.generatedCode,
      isPublished: true,
      communityPost: { create: { userId: user.id, tags: body.tags ?? [] } }
    },
    include: { communityPost: true }
  });
  return NextResponse.json({ flowchart });
}
