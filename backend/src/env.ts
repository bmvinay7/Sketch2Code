import dotenv from "dotenv";

// Load environment variables as a side effect of importing this module.
// Importing this file FIRST in index.ts guarantees that any subsequent
// imports (routes, services) see the populated process.env, regardless of
// whether they read it at module-load time or lazily on request.
dotenv.config();
