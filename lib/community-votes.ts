import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

interface VoteRow {
  id: string;
  value: number;
}

let votesTableReady = false;

async function ensureVotesTable() {
  if (votesTableReady) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "PostVote" (
      "id" TEXT PRIMARY KEY,
      "postId" TEXT NOT NULL REFERENCES "CommunityPost"("id") ON DELETE CASCADE,
      "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "value" INTEGER NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE ("userId", "postId")
    )
  `);

  votesTableReady = true;
}

export async function togglePostVote(postId: string, userId: string, value: 1 | -1) {
  await ensureVotesTable();

  const existing = await prisma.$queryRaw<VoteRow[]>(Prisma.sql`
    SELECT "id", "value"
    FROM "PostVote"
    WHERE "userId" = ${userId} AND "postId" = ${postId}
    LIMIT 1
  `);

  const current = existing[0];
  if (current?.value === value) {
    await prisma.$transaction([
      prisma.$executeRaw(Prisma.sql`DELETE FROM "PostVote" WHERE "id" = ${current.id}`),
      prisma.communityPost.update({ where: { id: postId }, data: { upvotes: { decrement: value } } })
    ]);
    return { message: "Vote removed" };
  }

  if (current) {
    await prisma.$transaction([
      prisma.$executeRaw(Prisma.sql`UPDATE "PostVote" SET "value" = ${value} WHERE "id" = ${current.id}`),
      prisma.communityPost.update({ where: { id: postId }, data: { upvotes: { increment: value * 2 } } })
    ]);
    return { message: "Vote changed" };
  }

  await prisma.$transaction([
    prisma.$executeRaw(Prisma.sql`
      INSERT INTO "PostVote" ("id", "postId", "userId", "value", "createdAt")
      VALUES (${crypto.randomUUID()}, ${postId}, ${userId}, ${value}, NOW())
    `),
    prisma.communityPost.update({ where: { id: postId }, data: { upvotes: { increment: value } } })
  ]);

  return { message: "Vote added" };
}
