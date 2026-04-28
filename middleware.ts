import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher(["/canvas(.*)", "/profile(.*)"]);
const authDisabled = process.env.DISABLE_AUTH === "true";
const hasClerkKeys = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY && !authDisabled);

const middleware = hasClerkKeys
  ? clerkMiddleware(async (auth, request) => {
      if (isProtectedRoute(request)) {
        await auth.protect();
      }
    })
  : function localNoAuthMiddleware() {
      return NextResponse.next();
    };

export default middleware;

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"]
};
