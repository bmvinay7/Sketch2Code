import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ClerkEmail {
  email_address?: string;
}

interface ClerkUserPayload {
  id: string;
  first_name?: string;
  last_name?: string;
  image_url?: string;
  email_addresses?: ClerkEmail[];
}

export async function POST(request: Request) {
  const body = (await request.json()) as { type?: string; data?: ClerkUserPayload };
  if (body.type !== "user.created" || !body.data) {
    return NextResponse.json({ ok: true });
  }
  const name = [body.data.first_name, body.data.last_name].filter(Boolean).join(" ") || "Sketch2Code User";
  const email = body.data.email_addresses?.[0]?.email_address;
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });
  await prisma.user.upsert({
    where: { clerkId: body.data.id },
    update: { name, email, avatar: body.data.image_url },
    create: { clerkId: body.data.id, name, email, avatar: body.data.image_url }
  });
  return NextResponse.json({ ok: true });
}
