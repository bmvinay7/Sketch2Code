import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface CommunityComment {
  id: string;
  body: string;
  createdAt: Date;
  user: {
    name: string;
    avatar: string | null;
  };
}

interface CommentCountRow {
  postId: string;
  count: bigint | number;
}

interface CommentRow {
  id: string;
  body: string;
  createdAt: Date;
  userName: string;
  userAvatar: string | null;
}

let commentsTableReady = false;

async function ensureCommentsTable() {
  if (commentsTableReady) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Comment" (
      "id" TEXT PRIMARY KEY,
      "body" TEXT NOT NULL,
      "postId" TEXT NOT NULL REFERENCES "CommunityPost"("id") ON DELETE CASCADE,
      "userId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  commentsTableReady = true;
}

function mapComment(row: CommentRow): CommunityComment {
  return {
    id: row.id,
    body: row.body,
    createdAt: row.createdAt,
    user: {
      name: row.userName,
      avatar: row.userAvatar
    }
  };
}

export async function listComments(postId: string) {
  await ensureCommentsTable();

  const rows = await prisma.$queryRaw<CommentRow[]>(Prisma.sql`
    SELECT
      c."id",
      c."body",
      c."createdAt",
      u."name" AS "userName",
      u."avatar" AS "userAvatar"
    FROM "Comment" c
    JOIN "User" u ON u."id" = c."userId"
    WHERE c."postId" = ${postId}
    ORDER BY c."createdAt" ASC
  `);

  return rows.map(mapComment);
}

export async function listCommentCounts(postIds: string[]) {
  await ensureCommentsTable();
  if (postIds.length === 0) return new Map<string, number>();

  const rows = await prisma.$queryRaw<CommentCountRow[]>(Prisma.sql`
    SELECT c."postId", COUNT(*) AS "count"
    FROM "Comment" c
    WHERE c."postId" IN (${Prisma.join(postIds)})
    GROUP BY c."postId"
  `);

  return new Map(rows.map((row) => [row.postId, Number(row.count)]));
}

export async function createComment(postId: string, userId: string, body: string) {
  await ensureCommentsTable();

  const rows = await prisma.$queryRaw<CommentRow[]>(Prisma.sql`
    INSERT INTO "Comment" ("id", "body", "postId", "userId", "createdAt")
    VALUES (${crypto.randomUUID()}, ${body}, ${postId}, ${userId}, NOW())
    RETURNING
      "id",
      "body",
      "createdAt",
      (SELECT "name" FROM "User" WHERE "id" = ${userId}) AS "userName",
      (SELECT "avatar" FROM "User" WHERE "id" = ${userId}) AS "userAvatar"
  `);

  return rows[0] ? mapComment(rows[0]) : null;
}
