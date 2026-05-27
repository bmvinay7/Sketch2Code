import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const DEV_USER = {
  clerkId: "local-dev-user",
  name: "Local Dev",
  email: "dev@sketch2code.local",
  avatar: null as string | null
};

/**
 * Resolve the User row that should own a write. When DISABLE_AUTH=true we
 * mirror the middleware's escape hatch and use a deterministic local user
 * (upserted on first call) so dev mode is coherent end-to-end. Otherwise
 * we read the Clerk session.
 *
 * Return shape: { user } on success, or { error, status } the caller
 * can hand straight to NextResponse.json.
 */
type ResolveResult =
  | { ok: true; user: { id: string } }
  | { ok: false; error: string; status: number };

export async function resolveWriter(): Promise<ResolveResult> {
  try {
    if (process.env.DISABLE_AUTH === "true") {
      const user = await prisma.user.upsert({
        where: { clerkId: DEV_USER.clerkId },
        update: {},
        create: DEV_USER
      });
      return { ok: true, user };
    }

    const { userId } = await auth();
    if (!userId) return { ok: false, error: "Sign in to perform this action.", status: 401 };
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (!user) {
      return {
        ok: false,
        error: "Your account hasn't synced from Clerk yet. Try again in a moment.",
        status: 409
      };
    }
    return { ok: true, user };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/can.?t reach database|ECONNREFUSED|PrismaClientInitializationError/i.test(message)) {
      return { ok: false, error: "Database unavailable. Start Postgres and retry.", status: 503 };
    }
    console.error("[resolveWriter]", error);
    return { ok: false, error: "Authentication subsystem failed.", status: 500 };
  }
}
