import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { requireDatabaseUser } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { flowchartId } = body;

  if (!flowchartId) return NextResponse.json({ error: "Missing flowchartId" }, { status: 400 });

  const user = await requireDatabaseUser(userId);
  if (!user) return NextResponse.json({ error: "User not synced" }, { status: 409 });

  const original = await prisma.flowchart.findUnique({ where: { id: flowchartId } });
  if (!original) return NextResponse.json({ error: "Flowchart not found" }, { status: 404 });

  const cloned = await prisma.flowchart.create({
    data: {
      userId: user.id,
      title: `${original.title} (Remix)`,
      problem: original.problem,
      language: original.language,
      shapes: original.shapes as never,
      generatedCode: original.generatedCode,
      isPublished: false
    }
  });

  return NextResponse.json({ id: cloned.id });
}
