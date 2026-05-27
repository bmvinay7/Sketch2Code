import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveWriter } from "@/lib/currentUser";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("language");
  const q = searchParams.get("q");
  try {
    const posts = await prisma.communityPost.findMany({
      where: {
        flowchart: {
          isPublished: true,
          language: language && language !== "All" ? language.toLowerCase() : undefined,
          OR: q
            ? [
                { title: { contains: q, mode: "insensitive" } },
                { problem: { contains: q, mode: "insensitive" } }
              ]
            : undefined
        }
      },
      include: { flowchart: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
      take: 24
    });
    return NextResponse.json({ posts });
  } catch (error) {
    console.error("[community.GET]", error);
    return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  let body: {
    title?: string;
    problem?: string;
    language?: string;
    shapes?: unknown;
    generatedCode?: string;
    tags?: string[];
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }
  if (!body.title || !body.language) {
    return NextResponse.json({ error: "title and language are required." }, { status: 400 });
  }

  const writer = await resolveWriter();
  if (!writer.ok) return NextResponse.json({ error: writer.error }, { status: writer.status });

  try {
    const flowchart = await prisma.flowchart.create({
      data: {
        userId: writer.user.id,
        title: body.title,
        problem: body.problem,
        language: body.language,
        shapes: (body.shapes ?? []) as Prisma.InputJsonValue,
        generatedCode: body.generatedCode ?? "",
        isPublished: true,
        communityPost: { create: { userId: writer.user.id, tags: body.tags ?? [] } }
      },
      include: { communityPost: true }
    });
    return NextResponse.json({ flowchart });
  } catch (error) {
    console.error("[community.POST]", error);
    const message = error instanceof Error ? error.message : "Database write failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
