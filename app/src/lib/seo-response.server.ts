import { SITE_URL } from "./content";

const CANONICAL_HOST = new URL(SITE_URL).host;

/**
 * Prevent preview hosts and error pages from being indexed without changing
 * how the Higgsfield preview itself renders.
 */
export function applySeoResponseHeaders(response: Response, request: Request): Response {
  const headers = new Headers(response.headers);
  const contentType = headers.get("content-type") ?? "";
  const isHtml = contentType.includes("text/html");
  const isNonCanonicalHost = new URL(request.url).host !== CANONICAL_HOST;

  if (response.status >= 400 || (isHtml && isNonCanonicalHost)) {
    headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
