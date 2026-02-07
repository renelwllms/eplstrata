export function getCsrfToken() {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|; )csrf_token=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function withCsrfHeaders(headers?: HeadersInit) {
  const token = getCsrfToken();
  const base: Record<string, string> = {
    "Content-Type": "application/json",
    "x-csrf-token": token ?? ""
  };

  if (!headers) {
    return base;
  }

  if (headers instanceof Headers) {
    const merged = new Headers(headers);
    Object.entries(base).forEach(([key, value]) => merged.set(key, value));
    return merged;
  }

  if (Array.isArray(headers)) {
    return [...headers, ...Object.entries(base)];
  }

  return { ...headers, ...base };
}
