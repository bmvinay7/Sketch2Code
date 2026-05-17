import { PrismaClient } from "@prisma/client";
import { existsSync, readFileSync } from "fs";

function loadLocalEnv() {
  if (!existsSync(".env.local")) return;

  for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    const rawValue = trimmed.slice(equalsIndex + 1).trim();
    if (!key || process.env[key]) continue;
    process.env[key] = rawValue.replace(/^["']|["']$/g, "");
  }
}

loadLocalEnv();

const prisma = new PrismaClient();

type AlgorithmSeed = {
  title: string;
  problem: string;
  language: string;
  tags: string[];
  steps: string[];
  code: string;
};

const authors = [
  { clerkId: "seed_alex", name: "Alex Node", email: "alex.seed@sketch2code.dev", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" },
  { clerkId: "seed_mira", name: "Mira Trace", email: "mira.seed@sketch2code.dev", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mira" },
  { clerkId: "seed_dev", name: "Dev Queue", email: "dev.seed@sketch2code.dev", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dev" },
  { clerkId: "seed_nia", name: "Nia Graph", email: "nia.seed@sketch2code.dev", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nia" }
];

const algorithms: AlgorithmSeed[] = [
  {
    title: "Linear Search",
    problem: "Scan an unsorted array from left to right and return the index where the target first appears.",
    language: "python",
    tags: ["array", "search", "beginner"],
    steps: ["Set i = 0", "i < n?", "arr[i] == target?", "return i", "i = i + 1", "return -1"],
    code: `def linear_search(arr, target):
    for i, value in enumerate(arr):
        if value == target:
            return i
    return -1
`
  },
  {
    title: "Binary Search",
    problem: "Find a target in a sorted array by repeatedly halving the active search interval.",
    language: "python",
    tags: ["array", "search", "logarithmic"],
    steps: ["low = 0, high = n - 1", "low <= high?", "mid = (low + high) // 2", "arr[mid] == target?", "target < arr[mid]?", "move high or low", "return -1"],
    code: `def binary_search(arr, target):
    low, high = 0, len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        if target < arr[mid]:
            high = mid - 1
        else:
            low = mid + 1
    return -1
`
  },
  {
    title: "Bubble Sort",
    problem: "Sort an array by bubbling the largest unsorted value to the end on every pass.",
    language: "python",
    tags: ["array", "sorting", "in-place"],
    steps: ["for pass in range(n)", "swapped = False", "compare neighbors", "left > right?", "swap values", "no swaps?", "return array"],
    code: `def bubble_sort(nums):
    n = len(nums)
    for end in range(n - 1, 0, -1):
        swapped = False
        for i in range(end):
            if nums[i] > nums[i + 1]:
                nums[i], nums[i + 1] = nums[i + 1], nums[i]
                swapped = True
        if not swapped:
            break
    return nums
`
  },
  {
    title: "Selection Sort",
    problem: "Sort an array by selecting the minimum remaining element and placing it into the next slot.",
    language: "python",
    tags: ["array", "sorting", "in-place"],
    steps: ["i from 0 to n - 1", "min_index = i", "scan j after i", "nums[j] < nums[min]?", "update min_index", "swap i and min", "return array"],
    code: `def selection_sort(nums):
    for i in range(len(nums)):
        min_index = i
        for j in range(i + 1, len(nums)):
            if nums[j] < nums[min_index]:
                min_index = j
        nums[i], nums[min_index] = nums[min_index], nums[i]
    return nums
`
  },
  {
    title: "Insertion Sort",
    problem: "Build a sorted prefix by inserting each new value into its correct position.",
    language: "python",
    tags: ["array", "sorting", "stable"],
    steps: ["i from 1 to n - 1", "key = nums[i]", "j = i - 1", "nums[j] > key?", "shift nums[j]", "insert key", "return array"],
    code: `def insertion_sort(nums):
    for i in range(1, len(nums)):
        key = nums[i]
        j = i - 1
        while j >= 0 and nums[j] > key:
            nums[j + 1] = nums[j]
            j -= 1
        nums[j + 1] = key
    return nums
`
  },
  {
    title: "Merge Sort",
    problem: "Sort an array with divide and conquer, then merge sorted halves.",
    language: "python",
    tags: ["array", "sorting", "divide-conquer"],
    steps: ["len(nums) <= 1?", "split at middle", "sort left half", "sort right half", "merge smaller front", "append leftovers", "return merged"],
    code: `def merge_sort(nums):
    if len(nums) <= 1:
        return nums
    mid = len(nums) // 2
    left = merge_sort(nums[:mid])
    right = merge_sort(nums[mid:])
    merged = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            merged.append(left[i]); i += 1
        else:
            merged.append(right[j]); j += 1
    return merged + left[i:] + right[j:]
`
  },
  {
    title: "Quick Sort Partition",
    problem: "Partition around a pivot so values less than the pivot move left and larger values move right.",
    language: "python",
    tags: ["array", "sorting", "partition"],
    steps: ["choose last value as pivot", "store = low", "scan i from low to high", "nums[i] < pivot?", "swap with store", "store++", "place pivot", "return pivot index"],
    code: `def partition(nums, low, high):
    pivot = nums[high]
    store = low
    for i in range(low, high):
        if nums[i] < pivot:
            nums[store], nums[i] = nums[i], nums[store]
            store += 1
    nums[store], nums[high] = nums[high], nums[store]
    return store
`
  },
  {
    title: "Heap Sort",
    problem: "Transform an array into a max heap, then repeatedly move the maximum to the sorted suffix.",
    language: "python",
    tags: ["array", "sorting", "heap"],
    steps: ["build max heap", "end = n - 1", "swap root with end", "heap size--", "heapify root", "end == 0?", "return array"],
    code: `def heap_sort(nums):
    def heapify(size, root):
        largest = root
        left, right = 2 * root + 1, 2 * root + 2
        if left < size and nums[left] > nums[largest]:
            largest = left
        if right < size and nums[right] > nums[largest]:
            largest = right
        if largest != root:
            nums[root], nums[largest] = nums[largest], nums[root]
            heapify(size, largest)

    for i in range(len(nums) // 2 - 1, -1, -1):
        heapify(len(nums), i)
    for end in range(len(nums) - 1, 0, -1):
        nums[0], nums[end] = nums[end], nums[0]
        heapify(end, 0)
    return nums
`
  },
  {
    title: "Breadth First Search",
    problem: "Traverse a graph level by level from a start node using a queue.",
    language: "python",
    tags: ["graph", "queue", "traversal"],
    steps: ["enqueue start", "mark visited", "queue not empty?", "pop front node", "visit node", "for each neighbor", "unvisited?", "enqueue neighbor"],
    code: `from collections import deque

def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    order = []
    while queue:
        node = queue.popleft()
        order.append(node)
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
    return order
`
  },
  {
    title: "Depth First Search",
    problem: "Traverse a graph by exploring each branch before backtracking.",
    language: "python",
    tags: ["graph", "stack", "traversal"],
    steps: ["push start", "stack not empty?", "pop node", "already visited?", "mark visited", "visit node", "push reversed neighbors", "return order"],
    code: `def dfs(graph, start):
    visited = set()
    stack = [start]
    order = []
    while stack:
        node = stack.pop()
        if node in visited:
            continue
        visited.add(node)
        order.append(node)
        stack.extend(reversed(graph[node]))
    return order
`
  },
  {
    title: "Dijkstra Shortest Path",
    problem: "Find minimum distances from a source in a weighted graph with non-negative edge weights.",
    language: "python",
    tags: ["graph", "shortest-path", "heap"],
    steps: ["dist[source] = 0", "push source heap", "heap not empty?", "pop smallest distance", "stale entry?", "relax each edge", "better distance?", "push neighbor"],
    code: `import heapq

def dijkstra(graph, source):
    dist = {node: float("inf") for node in graph}
    dist[source] = 0
    heap = [(0, source)]
    while heap:
        current, node = heapq.heappop(heap)
        if current != dist[node]:
            continue
        for neighbor, weight in graph[node]:
            candidate = current + weight
            if candidate < dist[neighbor]:
                dist[neighbor] = candidate
                heapq.heappush(heap, (candidate, neighbor))
    return dist
`
  },
  {
    title: "Bellman Ford",
    problem: "Compute shortest paths with negative edges and detect reachable negative cycles.",
    language: "python",
    tags: ["graph", "shortest-path", "negative-edges"],
    steps: ["dist[source] = 0", "repeat V - 1 times", "for each edge", "can relax?", "update distance", "scan edges again", "still relaxes?", "negative cycle"],
    code: `def bellman_ford(vertices, edges, source):
    dist = {v: float("inf") for v in vertices}
    dist[source] = 0
    for _ in range(len(vertices) - 1):
        changed = False
        for u, v, w in edges:
            if dist[u] + w < dist[v]:
                dist[v] = dist[u] + w
                changed = True
        if not changed:
            break
    for u, v, w in edges:
        if dist[u] + w < dist[v]:
            raise ValueError("negative cycle")
    return dist
`
  },
  {
    title: "Floyd Warshall",
    problem: "Compute all-pairs shortest paths by allowing each vertex as an intermediate step.",
    language: "python",
    tags: ["graph", "dynamic-programming", "shortest-path"],
    steps: ["copy distance matrix", "for k in vertices", "for i in vertices", "for j in vertices", "path via k better?", "update dist[i][j]", "return matrix"],
    code: `def floyd_warshall(dist):
    n = len(dist)
    result = [row[:] for row in dist]
    for k in range(n):
        for i in range(n):
            for j in range(n):
                result[i][j] = min(result[i][j], result[i][k] + result[k][j])
    return result
`
  },
  {
    title: "Kruskal Minimum Spanning Tree",
    problem: "Build a minimum spanning tree by accepting the cheapest edge that connects two different components.",
    language: "python",
    tags: ["graph", "mst", "union-find"],
    steps: ["sort edges by weight", "make each node a set", "for each edge", "different components?", "union components", "add edge to MST", "MST has V - 1 edges?", "return MST"],
    code: `def kruskal(nodes, edges):
    parent = {node: node for node in nodes}

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]
            x = parent[x]
        return x

    mst = []
    for u, v, weight in sorted(edges, key=lambda edge: edge[2]):
        ru, rv = find(u), find(v)
        if ru != rv:
            parent[ru] = rv
            mst.append((u, v, weight))
    return mst
`
  },
  {
    title: "Prim Minimum Spanning Tree",
    problem: "Grow a minimum spanning tree from one node by repeatedly taking the cheapest outgoing edge.",
    language: "python",
    tags: ["graph", "mst", "heap"],
    steps: ["start from any node", "push outgoing edges", "heap not empty?", "pop cheapest edge", "node already in tree?", "accept edge", "push new outgoing edges", "return MST"],
    code: `import heapq

def prim(graph, start):
    visited = {start}
    heap = [(weight, start, to) for to, weight in graph[start]]
    heapq.heapify(heap)
    mst = []
    while heap:
        weight, frm, to = heapq.heappop(heap)
        if to in visited:
            continue
        visited.add(to)
        mst.append((frm, to, weight))
        for nxt, cost in graph[to]:
            if nxt not in visited:
                heapq.heappush(heap, (cost, to, nxt))
    return mst
`
  },
  {
    title: "Binary Search Tree Insert",
    problem: "Insert a value into a binary search tree while preserving the left-smaller right-larger invariant.",
    language: "python",
    tags: ["tree", "bst", "insert"],
    steps: ["tree empty?", "create node", "value < root.val?", "insert left", "value > root.val?", "insert right", "return root"],
    code: `def insert(root, value):
    if root is None:
        return Node(value)
    if value < root.val:
        root.left = insert(root.left, value)
    elif value > root.val:
        root.right = insert(root.right, value)
    return root
`
  },
  {
    title: "AVL Left Rotation",
    problem: "Repair a right-heavy AVL node by rotating the right child up and the unbalanced node down-left.",
    language: "python",
    tags: ["tree", "avl", "rotation"],
    steps: ["y = x.right", "t2 = y.left", "y.left = x", "x.right = t2", "update height x", "update height y", "return y"],
    code: `def rotate_left(x):
    y = x.right
    t2 = y.left
    y.left = x
    x.right = t2
    x.height = 1 + max(height(x.left), height(x.right))
    y.height = 1 + max(height(y.left), height(y.right))
    return y
`
  },
  {
    title: "Trie Insert And Search",
    problem: "Store words by character path and search by walking the same character edges.",
    language: "python",
    tags: ["string", "trie", "prefix"],
    steps: ["start at root", "for char in word", "child exists?", "create child", "move to child", "mark word end", "search follows chars", "return end flag"],
    code: `class Trie:
    def __init__(self):
        self.children = {}
        self.end = False

    def insert(self, word):
        node = self
        for char in word:
            node = node.children.setdefault(char, Trie())
        node.end = True

    def search(self, word):
        node = self
        for char in word:
            if char not in node.children:
                return False
            node = node.children[char]
        return node.end
`
  },
  {
    title: "Segment Tree Range Sum",
    problem: "Answer range-sum queries by recursively combining covered segment totals.",
    language: "python",
    tags: ["array", "segment-tree", "range-query"],
    steps: ["build tree nodes", "query node range", "no overlap?", "return 0", "full overlap?", "return node sum", "split at mid", "combine left and right"],
    code: `def query(tree, node, start, end, left, right):
    if right < start or end < left:
        return 0
    if left <= start and end <= right:
        return tree[node]
    mid = (start + end) // 2
    return query(tree, node * 2, start, mid, left, right) + query(tree, node * 2 + 1, mid + 1, end, left, right)
`
  },
  {
    title: "Union Find",
    problem: "Track disjoint sets with path compression and union by rank.",
    language: "python",
    tags: ["graph", "union-find", "sets"],
    steps: ["make parent array", "find(x)", "parent[x] != x?", "compress parent", "union(a, b)", "roots differ?", "attach lower rank", "update rank"],
    code: `class UnionFind:
    def __init__(self, n):
        self.parent = list(range(n))
        self.rank = [0] * n

    def find(self, x):
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]

    def union(self, a, b):
        ra, rb = self.find(a), self.find(b)
        if ra == rb:
            return False
        if self.rank[ra] < self.rank[rb]:
            ra, rb = rb, ra
        self.parent[rb] = ra
        if self.rank[ra] == self.rank[rb]:
            self.rank[ra] += 1
        return True
`
  }
];

const comments = [
  "The decision split makes the edge case easy to follow.",
  "I like how the loop state is visible in the board.",
  "The code matches the sketch without hiding the important branch.",
  "Saved this for revision. The failure path is clear.",
  "This board makes the invariant much easier to discuss."
];

function baseElement(type: string, id: string, x: number, y: number, width: number, height: number, strokeColor: string) {
  return {
    id,
    type,
    x,
    y,
    width,
    height,
    angle: 0,
    strokeColor,
    backgroundColor: type === "text" ? "transparent" : "#ffffff",
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    groupIds: [],
    frameId: null,
    roundness: type === "rectangle" ? { type: 3 } : null,
    seed: id.split("").reduce((total, char) => total + char.charCodeAt(0), 0),
    version: 1,
    versionNonce: id.length * 997,
    isDeleted: false,
    boundElements: null,
    updated: Date.now(),
    link: null,
    locked: false
  };
}

function textElement(id: string, text: string, x: number, y: number, width: number, height: number, color = "#111111") {
  return {
    ...baseElement("text", id, x, y, width, height, color),
    text,
    fontSize: text.length > 28 ? 16 : 18,
    fontFamily: 3,
    textAlign: "center",
    verticalAlign: "middle",
    containerId: null,
    originalText: text,
    lineHeight: 1.25,
    baseline: Math.floor(height * 0.7)
  };
}

function arrowElement(id: string, x1: number, y1: number, x2: number, y2: number) {
  return {
    ...baseElement("arrow", id, x1, y1, x2 - x1, y2 - y1, "#2563eb"),
    backgroundColor: "transparent",
    points: [[0, 0], [x2 - x1, y2 - y1]],
    startBinding: null,
    endBinding: null,
    startArrowhead: null,
    endArrowhead: "arrow"
  };
}

function buildScene(seed: AlgorithmSeed) {
  const elements: Array<Record<string, unknown>> = [
    baseElement("ellipse", "start", 320, 40, 220, 64, "#16a34a"),
    textElement("start_text", "Start", 355, 57, 150, 30, "#166534")
  ];

  let y = 150;
  seed.steps.slice(0, 8).forEach((step, index) => {
    const isDecision = step.includes("?") || /^if|while|for/i.test(step);
    const shapeId = `shape_${index}`;
    const textId = `text_${index}`;
    const x = isDecision ? 330 : 280;
    const width = isDecision ? 200 : 300;
    const height = isDecision ? 96 : 68;

    elements.push(baseElement(isDecision ? "diamond" : "rectangle", shapeId, x, y, width, height, isDecision ? "#f59e0b" : "#2563eb"));
    elements.push(textElement(textId, step, x + 24, y + height / 2 - 14, width - 48, 30, isDecision ? "#92400e" : "#1d4ed8"));

    const prevBottom = index === 0 ? 104 : y - 28;
    elements.push(arrowElement(`arrow_${index}`, 430, prevBottom, 430, y));
    y += height + 72;
  });

  elements.push(baseElement("ellipse", "end", 320, y, 220, 64, "#dc2626"));
  elements.push(textElement("end_text", "End", 365, y + 17, 130, 30, "#991b1b"));
  elements.push(arrowElement("arrow_end", 430, y - 72, 430, y));

  return JSON.stringify({
    shapes: [],
    connections: [],
    files: {},
    appState: {
      viewBackgroundColor: "#fffefa",
      scrollX: -210,
      scrollY: 10,
      zoom: { value: 0.72 },
      viewModeEnabled: false
    },
    sceneElements: elements
  });
}

async function main() {
  const legacyUsers = await prisma.user.findMany({
    where: { clerkId: { in: ["clerk_1", "clerk_2", "clerk_3", "clerk_4"] } },
    select: { id: true }
  });
  const legacyUserIds = legacyUsers.map((user) => user.id);

  if (legacyUserIds.length > 0) {
    await prisma.comment.deleteMany({
      where: {
        OR: [
          { userId: { in: legacyUserIds } },
          { post: { flowchart: { userId: { in: legacyUserIds } } } }
        ]
      }
    });
    await prisma.postVote.deleteMany({
      where: {
        OR: [
          { userId: { in: legacyUserIds } },
          { post: { flowchart: { userId: { in: legacyUserIds } } } }
        ]
      }
    });
    await prisma.save.deleteMany({
      where: {
        OR: [
          { userId: { in: legacyUserIds } },
          { post: { flowchart: { userId: { in: legacyUserIds } } } }
        ]
      }
    });
    await prisma.communityPost.deleteMany({
      where: { flowchart: { userId: { in: legacyUserIds } } }
    });
    await prisma.flowchart.deleteMany({
      where: { userId: { in: legacyUserIds } }
    });
    await prisma.user.deleteMany({
      where: { id: { in: legacyUserIds } }
    });
  }

  const users = await Promise.all(
    authors.map((author) =>
      prisma.user.upsert({
        where: { clerkId: author.clerkId },
        update: author,
        create: author
      })
    )
  );

  for (const [index, algorithm] of algorithms.entries()) {
    const author = users[index % users.length];
    const existing = await prisma.flowchart.findFirst({
      where: { title: algorithm.title, userId: author.id },
      include: { communityPost: true }
    });

    const flowchart = existing
      ? await prisma.flowchart.update({
          where: { id: existing.id },
          data: {
            problem: algorithm.problem,
            language: algorithm.language,
            generatedCode: algorithm.code,
            shapes: buildScene(algorithm),
            isPublished: true
          }
        })
      : await prisma.flowchart.create({
          data: {
            userId: author.id,
            title: algorithm.title,
            problem: algorithm.problem,
            language: algorithm.language,
            generatedCode: algorithm.code,
            shapes: buildScene(algorithm),
            isPublished: true
          }
        });

    const post = await prisma.communityPost.upsert({
      where: { flowchartId: flowchart.id },
      update: {
        userId: author.id,
        upvotes: 18 + index * 3,
        views: 120 + index * 37,
        tags: JSON.stringify(algorithm.tags),
        isVerified: index % 3 === 0
      },
      create: {
        flowchartId: flowchart.id,
        userId: author.id,
        upvotes: 18 + index * 3,
        views: 120 + index * 37,
        tags: JSON.stringify(algorithm.tags),
        isVerified: index % 3 === 0
      }
    });

    await prisma.comment.deleteMany({ where: { postId: post.id } });
    await prisma.postVote.deleteMany({ where: { postId: post.id } });
    await prisma.save.deleteMany({ where: { postId: post.id } });

    await prisma.comment.createMany({
      data: [0, 1].map((offset) => {
        const commenter = users[(index + offset + 1) % users.length];
        return {
          postId: post.id,
          userId: commenter.id,
          body: comments[(index + offset) % comments.length]
        };
      })
    });

    await prisma.postVote.createMany({
      data: users.slice(0, Math.min(users.length, 3)).map((user) => ({
        postId: post.id,
        userId: user.id,
        value: 1
      })),
      skipDuplicates: true
    });

    console.log(`Seeded ${algorithm.title}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
