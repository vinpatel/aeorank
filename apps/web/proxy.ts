import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
	"/dashboard(.*)",
	"/sites(.*)",
	"/upgrade(.*)",
]);

const isPublicApiRoute = createRouteMatcher([
	"/api/scan/process",
	"/api/webhooks/(.*)",
]);

export default clerkMiddleware((auth, req) => {
	if (isPublicApiRoute(req)) return;
	if (isProtectedRoute(req)) auth.protect();
});

export const config = {
	matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
