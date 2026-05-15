# Database Architecture

Sketch2Code stores each visual algorithm as a durable workspace. The relational model keeps users, private flowcharts, public posts, votes, saves, comments, and remix sources separate enough to scale without losing the original board state.

## Schema Overview

The Prisma schema uses PostgreSQL.

```prisma
User
Flowchart
CommunityPost
Comment
PostVote
Save
```

## Tables

### User

Represents a Clerk-backed application user.

Fields:

- `id`: internal app id.
- `clerkId`: Clerk user id, unique.
- `name`: display name.
- `email`: email address, unique.
- `avatar`: optional profile image.
- `createdAt`: first sync time.

Relationships:

- One user has many flowcharts.
- One user has many saves.
- One user has many comments.
- One user has many votes.

### Flowchart

Represents a private or published workspace.

Fields:

- `id`: workspace id used by `/canvas/[id]`.
- `userId`: owner.
- `title`: user or generated title.
- `problem`: optional problem context.
- `language`: target generation language.
- `shapes`: serialized canvas snapshot.
- `generatedCode`: latest generated code.
- `isPublished`: whether the workspace is public.
- `createdAt`: creation time.
- `updatedAt`: last save time.

Relationships:

- Belongs to one user.
- Can have one community post.

### CommunityPost

Represents a public feed entry backed by a flowchart.

Fields:

- `id`: public post id.
- `flowchartId`: unique published workspace reference.
- `userId`: publisher id.
- `upvotes`: denormalized vote total.
- `views`: view count.
- `tags`: serialized tag array.
- `isVerified`: moderation or quality marker.
- `createdAt`: publish time.

Relationships:

- Belongs to one flowchart.
- Has many saves.
- Has many comments.
- Has many votes.

### Comment

Represents discussion on a public post.

Fields:

- `id`: comment id.
- `postId`: community post id.
- `userId`: author id.
- `body`: comment text.
- `createdAt`: comment time.

Relationships:

- Belongs to one post.
- Belongs to one user.

### PostVote

Represents a single user vote.

Fields:

- `id`: vote id.
- `postId`: community post id.
- `userId`: voter id.
- `value`: `1` for upvote, `-1` for downvote.
- `createdAt`: vote time.

Constraint:

- `@@unique([userId, postId])` prevents duplicate votes per user/post.

### Save

Represents a saved public artifact in a user profile.

Fields:

- `id`: save id.
- `userId`: saver id.
- `postId`: saved post id.
- `savedAt`: save time.

Constraint:

- `@@unique([userId, postId])` prevents duplicate saves.

## Entity Relationships

```text
User 1 -> many Flowchart
Flowchart 1 -> 0..1 CommunityPost
CommunityPost 1 -> many Comment
CommunityPost 1 -> many Save
CommunityPost 1 -> many PostVote
User 1 -> many Comment
User 1 -> many Save
User 1 -> many PostVote
```

## Board Storage Structure

`Flowchart.shapes` stores a serialized `CanvasSceneSnapshot`:

```ts
interface CanvasSceneSnapshot {
  sceneElements: ReadonlyArray<Record<string, unknown>>;
  appState: Record<string, unknown>;
  files: Record<string, CanvasFileRecord>;
  shapes: FlowShape[];
  connections: CanvasConnection[];
}
```

The important Excalidraw data is:

- `sceneElements`: the visual objects rendered by Excalidraw.
- `appState`: viewport/background/view settings.
- `files`: uploaded image blobs referenced by Excalidraw.

The local `shapes` and `connections` arrays are retained for app-level metadata and future trace features.

## Excalidraw Snapshot Handling

The workspace captures live scene data through the Excalidraw API:

- `getSceneElements()`
- `getAppState()`
- `getFiles()`

On save, these values are normalized and serialized into `Flowchart.shapes`.

On restore, `normalizeCanvasSnapshot()` converts stored JSON back into initial data for Excalidraw.

On community pages, `FlowchartPreview` renders the stored snapshot in read-only mode. If old seed data has no stored scene elements, the preview renders a generated algorithm board fallback so the feed never shows an empty artifact.

## Feed Architecture

The community feed is built from `CommunityPost` records joined to:

- `flowchart`
- `flowchart.user`
- `saves`
- comment counts from `Comment`

Sorting:

- Latest: `createdAt desc`
- Most Upvoted: `upvotes desc`
- Most Saved: `saves._count desc`

Search:

- Flowchart title
- Flowchart problem context

## Likes, Comments, Saves, and Remix

Votes are stored as `PostVote` records and summarized into `CommunityPost.upvotes`.

Comments belong to posts and users. The UI renders them as the public discussion layer on a workspace artifact.

Saves are profile bookmarks. A saved post remains public and is shown in the user profile.

Remix clones a public `Flowchart` into the current user's private library. The cloned workspace keeps:

- title
- problem
- language
- Excalidraw snapshot
- generated code

The clone starts unpublished.

## Indexing Notes

Current unique constraints:

- `User.clerkId`
- `User.email`
- `CommunityPost.flowchartId`
- `PostVote.userId + postId`
- `Save.userId + postId`

Recommended future indexes:

- `Flowchart.userId`
- `Flowchart.updatedAt`
- `CommunityPost.createdAt`
- `CommunityPost.upvotes`
- `Comment.postId`
- `Save.userId`
- Full-text index over `Flowchart.title` and `Flowchart.problem`

## Scalable Architecture Notes

For early production, serialized Excalidraw snapshots in Postgres are acceptable. At higher scale:

- Move large `files` blobs to object storage.
- Store thumbnail images for feed cards.
- Add a `remixSourceId` field on `Flowchart`.
- Add a `tags` table instead of serialized JSON.
- Add materialized counters for comments and saves.
- Add search indexing through Postgres full text, Meilisearch, Typesense, or Algolia.
- Use Redis for AI cache and hot feed metadata.
