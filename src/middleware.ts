import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Hostname to Tenant ID mapping
// TODO: Move this to database lookup by custom_domain or slug
const HOSTNAME_TO_TENANT_ID: Record<string, string> = {
  "acme-podcasts.test": "550e8400-e29b-41d4-a716-446655440000",
  "indie-media.test": "770e8400-e29b-41d4-a716-446655440000",
  "localhost": "550e8400-e29b-41d4-a716-446655440000", // Keep for dev
};

export function middleware(request: NextRequest) {
  // Extract hostname from host header (remove port if present)
  const host = request.headers.get("host") || "localhost";
  const hostname = host.split(":")[0];

  // Get tenant ID from hostname mapping
  const tenantId = HOSTNAME_TO_TENANT_ID[hostname];

  // If no tenant found, continue without header (layout will handle error)
  if (!tenantId) {
    return NextResponse.next();
  }

  // Set custom header for tenant ID
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant-id", tenantId);

  // Get the pathname
  const { pathname } = request.nextUrl;

  // Don't rewrite API routes or special Next.js paths
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Rewrite URL to /tenant/[tenantId]/...
  // If pathname already starts with /tenant, don't rewrite again
  if (!pathname.startsWith(`/tenant/${tenantId}`)) {
    const url = request.nextUrl.clone();
    url.pathname = `/tenant/${tenantId}${pathname === "/" ? "" : pathname}`;
    
    return NextResponse.rewrite(url, {
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
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
