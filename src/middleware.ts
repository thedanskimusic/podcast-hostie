import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Placeholder for future tenant subdomain/custom domain routing
export function middleware(request: NextRequest) {
  // Future implementation: detect tenant from subdomain or custom domain
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
