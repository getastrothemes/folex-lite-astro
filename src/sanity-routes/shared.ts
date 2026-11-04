/**
 * Small helpers shared by the draft-mode (preview) endpoints.
 *
 * These files live outside `src/pages` on purpose: `astro.config.mjs` only
 * registers them (with `injectRoute`) when `SANITY_VISUAL_EDITING=true`, so
 * the normal static build never contains them.
 */
import type { AstroCookieSetOptions } from "astro";

/**
 * Cookie options for the draft-mode cookie. When the site is served over
 * HTTPS (also behind a proxy such as Netlify, Render or Fly) we use
 * `SameSite=None; Secure` so the cookie works inside the Studio's
 * Presentation iframe on another domain. Locally (http) we use `lax`.
 */
export const draftCookieOptions = (
  request: Request,
  url: URL,
): AstroCookieSetOptions => {
  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const isHttps = url.protocol === "https:" || forwardedProto === "https";

  return {
    path: "/",
    httpOnly: true,
    sameSite: isHttps ? "none" : "lax",
    secure: isHttps,
  };
};

/**
 * Turns an untrusted redirect value into a safe same-origin path.
 * Anything pointing to another site (`https://evil.com`, `//evil.com`,
 * `/\evil.com`) falls back to the homepage.
 */
export const safeRedirectPath = (
  value: string | null | undefined,
  url: URL,
): string => {
  if (!value) return "/";
  try {
    const target = new URL(value, url.origin);
    if (target.origin !== url.origin) return "/";
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return "/";
  }
};

/** A redirect that browsers and CDNs must never cache. */
export const noStoreRedirect = (location: string): Response =>
  new Response(null, {
    status: 307,
    headers: { Location: location, "Cache-Control": "no-store" },
  });

/** A plain-text response, used for friendly error messages. */
export const textResponse = (status: number, message: string): Response =>
  new Response(message, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
