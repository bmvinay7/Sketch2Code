import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

const DEV_USER = {
  clerkId: "local-dev-user",
  name: "Local Dev",
  email: "dev@sketch2code.local",
  avatar: null as string | null
};

type ResolveResult =
  | { ok: true; user: { id: string } }
  | { ok: false; error: string; status: number };

/**
 * Resolve the User row that should own a write.
 *
 * Two modes:
 * - DISABLE_AUTH=true (local dev): upsert a deterministic Local Dev user.
 * - normal (prod): read the Clerk session, then upsert the matching row from
 *   the current Clerk profile. The upsert is the "self-heal" path — if no
 *   webhook ever fired (Clerk -> /api/webhooks/clerk), the user still gets
 *   created on their first write. That makes the webhook a pure optimization
 *   rather than a hard dependency, which is the right trade for a demo.
 */
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

    // Fast path — row already exists, skip the Clerk API hit.
    const existing = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (existing) return { ok: true, user: existing };

    // Self-heal — pull the Clerk profile and create the row inline.
    const clerk = await currentUser();
    if (!clerk) {
      return { ok: false, error: "Clerk session was valid but the profile was unreachable.", status: 502 };
    }
    const email = clerk.emailAddresses?.[0]?.emailAddress ?? clerk.primaryEmailAddress?.emailAddress;
    if (!email) {
      return {
        ok: false,
        error: "Your Clerk account has no email address — add one in Clerk and retry.",
        status: 409
      };
    }
    const name =
      [clerk.firstName, clerk.lastName].filter(Boolean).join(" ") ||
      clerk.username ||
      email.split("@")[0];

    const user = await prisma.user.upsert({
      where: { clerkId: userId },
      update: { name, email, avatar: clerk.imageUrl ?? null },
      create: { clerkId: userId, name, email, avatar: clerk.imageUrl ?? null }
    });
    return { ok: true, user };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/can.?t reach database|ECONNREFUSED|PrismaClientInitializationError/i.test(message)) {
      return { ok: false, error: "Database unavailable. Start Postgres and retry.", status: 503 };
    }
    if (/unique constraint|P2002/i.test(message)) {
      // Race: another request created the row between findUnique and upsert.
      // Re-read and return; upsert by clerkId should normally avoid this but
      // a different unique field (email) could collide. One retry is cheap.
      try {
        const { userId } = await auth();
        if (userId) {
          const user = await prisma.user.findUnique({ where: { clerkId: userId } });
          if (user) return { ok: true, user };
        }
      } catch {}
      return { ok: false, error: "Another sign-up is racing for the same account. Retry.", status: 409 };
    }
    console.error("[resolveWriter]", error);
    return { ok: false, error: "Authentication subsystem failed.", status: 500 };
  }
}
