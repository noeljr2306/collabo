import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Define which routes are public (accessible without login)
const isPublicRoute = createRouteMatcher([
  "/",               // Landing page
  "/auth/sign-in(.*)",    // Sign in pages
  "/auth/sign-up(.*)",    // Sign up pages
]);

export default clerkMiddleware(async (auth, request) => {
  // 2. Protect all routes EXCEPT the public ones
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};