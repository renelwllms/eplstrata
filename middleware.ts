import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { rateLimit } from "./lib/rate-limit";

export const config = {
  matcher: ["/:path*"]
};

function buildCsp() {
  const mode = process.env.SECURITY_HEADERS_MODE ?? "relaxed";
  const isDev = process.env.NODE_ENV !== "production";
  const base = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "connect-src 'self' https:",
    "style-src 'self'" + (mode === "relaxed" ? " 'unsafe-inline'" : "")
  ];

  const scriptSrc = ["script-src 'self'"];
  if (mode === "relaxed") {
    scriptSrc.push("'unsafe-inline'");
    if (isDev) {
      scriptSrc.push("'unsafe-eval'");
    }
  }

  return [...base, scriptSrc.join(" ")].join("; ");
}

function buildSecurityHeaders() {
  const headers: Record<string, string> = {
    "Content-Security-Policy": buildCsp(),
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
    "X-DNS-Prefetch-Control": "off"
  };

  if (process.env.NODE_ENV === "production") {
    headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload";
  }

  return headers;
}

function buildCorsHeaders(origin: string | null) {
  const raw = process.env.CORS_ALLOWED_ORIGINS ?? "";
  const allowlist = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!origin || allowlist.length === 0 || !allowlist.includes(origin)) {
    return null;
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    Vary: "Origin"
  };
}

function getAllowedOrigins() {
  const raw = process.env.CORS_ALLOWED_ORIGINS ?? "";
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isSameOriginRequest(request: NextRequest) {
  const allowed = getAllowedOrigins();
  const requestOrigin = request.nextUrl.origin;
  const origin = request.headers.get("origin");
  if (origin) {
    return origin === requestOrigin || allowed.includes(origin);
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const refererOrigin = new URL(referer).origin;
      return refererOrigin === requestOrigin || allowed.includes(refererOrigin);
    } catch {
      return false;
    }
  }

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite) {
    return fetchSite === "same-origin" || fetchSite === "same-site";
  }

  return false;
}

function ensureCsrfToken(request: NextRequest) {
  const cookieToken = request.cookies.get("csrf_token")?.value;
  const headerToken = request.headers.get("x-csrf-token");
  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    throw new Error("Invalid CSRF token");
  }
}

export function middleware(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  const applyHeaders = (response: NextResponse, corsHeaders: Record<string, string> | null) => {
    const securityHeaders = buildSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    if (corsHeaders) {
      Object.entries(corsHeaders).forEach(([key, value]) => response.headers.set(key, value));
    }
    if (!request.cookies.get("csrf_token")) {
      const token = crypto.randomUUID();
      response.cookies.set("csrf_token", token, {
        httpOnly: false,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/"
      });
    }
    return response;
  };

  if (process.env.APP_MODE === "api") {
    if (!request.nextUrl.pathname.startsWith("/api")) {
      const response = NextResponse.json({ error: "Not found" }, { status: 404 });
      return applyHeaders(response, buildCorsHeaders(request.headers.get("origin")));
    }
  }

  const isApi = request.nextUrl.pathname.startsWith("/api");
  const corsHeaders = buildCorsHeaders(request.headers.get("origin"));

  if (!isApi) {
    const response = NextResponse.next();
    return applyHeaders(response, corsHeaders);
  }

  if (request.method === "OPTIONS") {
    if (!corsHeaders) {
      return new NextResponse(null, { status: 204 });
    }
    return new NextResponse(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    if (!isSameOriginRequest(request)) {
      const response = NextResponse.json({ error: "Invalid origin" }, { status: 403 });
      return applyHeaders(response, corsHeaders);
    }

    const contentType = request.headers.get("content-type") ?? "";
    const requiresHeaderToken = contentType.includes("application/json");

    if (requiresHeaderToken) {
      try {
        ensureCsrfToken(request);
      } catch (error) {
        const response = NextResponse.json({ error: "Invalid CSRF token" }, { status: 403 });
        return applyHeaders(response, corsHeaders);
      }
    }
  }

  const result = rateLimit(ip);

  if (!result.allowed) {
    const retryAfter = Math.max(0, Math.ceil((result.resetAt - Date.now()) / 1000));
    const response = NextResponse.json(
      { error: "Rate limit exceeded" },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString()
        }
      }
    );
    return applyHeaders(response, corsHeaders);
  }

  const response = NextResponse.next();
  return applyHeaders(response, corsHeaders);
}
