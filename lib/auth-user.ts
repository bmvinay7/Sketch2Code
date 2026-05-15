import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function requireDatabaseUser(clerkId: string | null | undefined) {
  if (!clerkId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) return null;

  const name =
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ").trim() ||
    clerkUser.username ||
    email.split("@")[0];

  return prisma.user.upsert({
    where: { clerkId },
    update: {
      name,
      email,
      avatar: clerkUser.imageUrl
    },
    create: {
      clerkId,
      name,
      email,
      avatar: clerkUser.imageUrl
    }
  });
}
