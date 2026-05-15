import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { requireDatabaseUser } from "@/lib/auth-user";
import { generateSmartTitle } from "@/lib/flowcharts";
import { prisma } from "@/lib/prisma";

interface FlowchartBody {
  problemContext?: string;
  language: string;
  shapes: unknown;
  generatedCode: string;
  title?: string;
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const flowchart = await prisma.flowchart.findFirst({
    where: { id: params.id, user: { clerkId: userId } }
  });

  return NextResponse.json({ flowchart: flowchart ?? null });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await requireDatabaseUser(userId);
  if (!user) return NextResponse.json({ error: "User not synced" }, { status: 409 });

  const body = (await request.json()) as FlowchartBody;
  const title = body.title?.trim() || generateSmartTitle(body.problemContext, body.generatedCode, body.language);
  const existing = await prisma.flowchart.findUnique({ where: { id: params.id } });

  if (existing && existing.userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = {
    title,
    problem: body.problemContext,
    language: body.language,
    shapes: JSON.stringify(body.shapes),
    generatedCode: body.generatedCode
  };

  const flowchart = existing
    ? await prisma.flowchart.update({
        where: { id: params.id },
        data
      })
    : await prisma.flowchart.create({
        data: {
          id: params.id,
          userId: user.id,
          ...data
        }
      });

  return NextResponse.json({ flowchart });
}
