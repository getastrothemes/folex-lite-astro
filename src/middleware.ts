/**
 * Sets `Astro.locals.preview` for every request.
 *
 * Preview (drafts + visual editing) is only on when the site runs as the
 * preview server and the browser has a valid draft-mode cookie (set by
 * `/api/draft-mode/enable` from Sanity Studio). Static pages are always
 * built with published content.
 */
import { defineMiddleware } from "astro:middleware";
import {
  DRAFT_MODE_COOKIE,
  getDraftModeSecret,
  visualEditingEnabled,
} from "@/lib/sanity/env";

export const onRequest = defineMiddleware(async (context, next) => {
  context.locals.preview = false;

  // Prerendered pages have no real request: never read cookies or headers
  if (!visualEditingEnabled || context.isPrerendered) return next();

  const cookie = context.cookies.get(DRAFT_MODE_COOKIE)?.value;
  if (cookie) {
    const secret = await getDraftModeSecret();
    context.locals.preview = secret.length > 0 && cookie === secret;
  }

  const response = await next();

  // Draft content must never be cached by a browser or CDN
  if (context.locals.preview) {
    try {
      response.headers.set("Cache-Control", "private, no-store");
    } catch {
      // Some responses (e.g. redirects) have read-only headers
    }
  }
  return response;
});
