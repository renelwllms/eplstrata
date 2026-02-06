import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "./lib/rate-limit";

export const config = {
  matcher: ["/:path*"]
};

export function middleware(request: NextRequest) {
  const ip =
    request.ip ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  if (process.env.APP_MODE === "api") {
    if (!request.nextUrl.pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
  }

  if (!request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const result = rateLimit(ip);

  if (!result.allowed) {
    const retryAfter = Math.max(0, Math.ceil((result.resetAt - Date.now()) / 1000));
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString()
        }
      }
    );
  }

  return NextResponse.next();
}
