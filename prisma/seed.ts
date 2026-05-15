import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const algorithms = [
  { title: "Linear Search", problem: "Find target in an unsorted array by scanning." },
  { title: "Binary Search", problem: "Find target in a sorted array in O(log n) time." },
  { title: "Bubble Sort", problem: "Sort an array by repeatedly swapping adjacent elements." },
  { title: "Selection Sort", problem: "Sort an array by repeatedly finding the minimum element." },
  { title: "Insertion Sort", problem: "Sort an array by inserting elements into their correct position." },
  { title: "Merge Sort", problem: "Sort an array using divide and conquer." },
  { title: "Quick Sort", problem: "Sort an array using pivot partitioning." },
  { title: "Heap Sort", problem: "Sort an array using a binary heap." },
  { title: "Breadth-First Search (BFS)", problem: "Traverse a graph level by level." },
  { title: "Depth-First Search (DFS)", problem: "Traverse a graph branch by branch." },
  { title: "Dijkstra’s Algorithm", problem: "Find the shortest path from a source node to all other nodes." },
  { title: "Bellman-Ford Algorithm", problem: "Find shortest paths with negative weights." },
  { title: "Floyd–Warshall Algorithm", problem: "Find shortest paths between all pairs of vertices." },
  { title: "Kruskal’s Algorithm", problem: "Find the Minimum Spanning Tree of a graph." },
  { title: "Prim’s Algorithm", problem: "Find the Minimum Spanning Tree of a graph." },
  { title: "Binary Search Tree (BST) Operations", problem: "Insert, delete, and search in a BST." },
  { title: "AVL Tree Rotations", problem: "Perform left and right rotations to balance an AVL tree." },
  { title: "Trie (Prefix Tree) Search & Insert", problem: "Store and search strings efficiently." },
  { title: "Segment Tree Range Query", problem: "Query ranges and update array efficiently." },
  { title: "Union-Find / Disjoint Set Union (DSU)", problem: "Manage disjoint sets and their union." },
];

const realisticComments = [
  "This is a great visualization! Really helped me understand the edge cases.",
  "I noticed a small optimization that could be made here, but overall fantastic.",
  "Could you elaborate on the time complexity of the third step?",
  "Bookmarking this for my upcoming technical interviews.",
  "Beautifully drawn. The Excalidraw integration makes this so much clearer.",
  "I struggled with this algorithm for weeks until I saw this flowchart.",
  "Thanks for sharing! This makes the recurrence relation much more obvious.",
  "Is there a way to modify this to handle negative edge weights?",
  "Perfect explanation. Short, sweet, and to the point.",
  "I love how you separated the base case from the recursive calls visually."
];

function createExcalidrawShape(type: string, id: string, x: number, y: number, width: number, height: number, color: string = "#ffffff") {
  return {
    id,
    type,
    x,
    y,
    width,
    height,
    angle: 0,
    strokeColor: color,
    backgroundColor: "transparent",
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 0,
    opacity: 100,
    groupIds: [],
    roundness: type === "rectangle" ? { type: 3 } : null,
    seed: Math.floor(Math.random() * 1000000),
    version: 1,
    versionNonce: Math.floor(Math.random() * 1000000),
    isDeleted: false,
    boundElements: null,
    updated: Date.now()
  };
}

function createExcalidrawText(id: string, text: string, x: number, y: number, width: number, height: number, color: string = "#ffffff") {
  return {
    ...createExcalidrawShape("text", id, x, y, width, height, color),
    text,
    fontSize: 20,
    fontFamily: 3,
    textAlign: "center",
    verticalAlign: "middle",
    baseline: y + height / 2 + 5,
  };
}

function createExcalidrawArrow(id: string, startX: number, startY: number, endX: number, endY: number, startId: string, endId: string) {
  return {
    ...createExcalidrawShape("arrow", id, startX, startY, endX - startX, endY - startY, "#a3a3a3"),
    points: [[0, 0], [endX - startX, endY - startY]],
    startBinding: { elementId: startId, focus: 0, gap: 5 },
    endBinding: { elementId: endId, focus: 0, gap: 5 },
    startArrowhead: null,
    endArrowhead: "arrow"
  };
}

function generateExcalidrawJSON(title: string) {
  const elements = [
    // 1. Start Node
    createExcalidrawShape("rectangle", "s1", 300, 100, 240, 60, "#4a90e2"),
    createExcalidrawText("t1", `Start: ${title}`, 320, 115, 200, 30, "#4a90e2"),
    
    // 2. Decision Node
    createExcalidrawShape("diamond", "s2", 320, 240, 200, 100, "#f39c12"),
    createExcalidrawText("t2", "Condition Met?", 360, 275, 120, 30, "#f39c12"),

    // 3. Process Node
    createExcalidrawShape("rectangle", "s3", 560, 260, 180, 60, "#2ecc71"),
    createExcalidrawText("t3", "Process Step", 580, 275, 140, 30, "#2ecc71"),

    // 4. End Node
    createExcalidrawShape("ellipse", "s4", 320, 420, 200, 60, "#e74c3c"),
    createExcalidrawText("t4", "End / Return", 360, 435, 120, 30, "#e74c3c"),

    // Arrows
    createExcalidrawArrow("a1", 420, 160, 420, 240, "s1", "s2"), // Start -> Decision
    createExcalidrawArrow("a2", 520, 290, 560, 290, "s2", "s3"), // Decision -> Process
    createExcalidrawArrow("a3", 650, 260, 420, 130, "s3", "s1"), // Process -> Loop back to Start (rough)
    createExcalidrawArrow("a4", 420, 340, 420, 420, "s2", "s4"), // Decision -> End
  ];

  return JSON.stringify({
    shapes: [],
    connections: [],
    files: {},
    appState: { viewBackgroundColor: "#08111f", viewModeEnabled: true },
    sceneElements: elements
  });
}

async function main() {
  const dummyUsers = await Promise.all([
    prisma.user.create({ data: { clerkId: "clerk_1", name: "Alice Coder", email: "alice@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice" } }),
    prisma.user.create({ data: { clerkId: "clerk_2", name: "Bob Builder", email: "bob@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob" } }),
    prisma.user.create({ data: { clerkId: "clerk_3", name: "Charlie Dev", email: "charlie@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie" } }),
    prisma.user.create({ data: { clerkId: "clerk_4", name: "Dana Script", email: "dana@example.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dana" } }),
  ]);

  for (const algo of algorithms) {
    const author = dummyUsers[Math.floor(Math.random() * dummyUsers.length)];

    const flowchart = await prisma.flowchart.create({
      data: {
        userId: author.id,
        title: algo.title,
        problem: algo.problem,
        language: "", 
        generatedCode: "", 
        shapes: generateExcalidrawJSON(algo.title),
        isPublished: true,
      }
    });

    const upvotesCount = Math.floor(Math.random() * 50) + 10;

    const post = await prisma.communityPost.create({
      data: {
        flowchartId: flowchart.id,
        userId: author.id,
        upvotes: upvotesCount,
        views: Math.floor(Math.random() * 500) + 50,
        tags: JSON.stringify(["algorithm", "computer-science"])
      }
    });

    for (let i = 0; i < Math.min(upvotesCount, dummyUsers.length); i++) {
      if (Math.random() > 0.5) {
        await prisma.postVote.create({
          data: {
            postId: post.id,
            userId: dummyUsers[i].id,
            value: 1
          }
        });
      }
    }

    const numComments = Math.floor(Math.random() * 4) + 1;
    for (let i = 0; i < numComments; i++) {
      const commenter = dummyUsers[Math.floor(Math.random() * dummyUsers.length)];
      await prisma.comment.create({
        data: {
          postId: post.id,
          userId: commenter.id,
          body: realisticComments[Math.floor(Math.random() * realisticComments.length)]
        }
      });
    }

    console.log(`Created: ${algo.title} by ${author.name}`);
  }

  console.log("Seeding finished with proper Excalidraw scene elements.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
