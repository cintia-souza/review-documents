import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rate limiter per IP
const rateLimit = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW = 60_000;

// Stricter limit for auth endpoints
const AUTH_RATE_LIMIT_MAX = 10;
const AUTH_RATE_LIMIT_WINDOW = 300_000; // 5 minutes
const authRateLimit = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(
  map: Map<string, { count: number; resetAt: number }>,
  key: string,
  max: number,
  window: number
): boolean {
  const now = Date.now();
  const entry = map.get(key);

  if (!entry || now > entry.resetAt) {
    map.set(key, { count: 1, resetAt: now + window });
    return false;
  }

  entry.count++;
  return entry.count > max;
}

export function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const path = request.nextUrl.pathname;

  // Stricter rate limit for auth endpoints (brute force protection)
  if (path.startsWith("/api/auth")) {
    if (checkRateLimit(authRateLimit, ip, AUTH_RATE_LIMIT_MAX, AUTH_RATE_LIMIT_WINDOW)) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde 5 minutos." },
        { status: 429 }
      );
    }
  }

  // General rate limiting
  if (checkRateLimit(rateLimit, ip, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  // Block direct access to internal API routes
  if (path.startsWith("/api/") && !path.startsWith("/api/auth") && !path.startsWith("/api/webhooks")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const response = NextResponse.next();

  // Security headers on every response
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|icon.svg).*)",
  ],
};
