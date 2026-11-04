/**
 * GET /api/draft-mode/disable?redirect=/some-page/
 *
 * Removes the draft-mode cookie so the site shows published content again,
 * then sends the visitor back to `redirect` (same-site paths only) or "/".
 * Used by the Studio's Presentation tool and the "Exit preview" link.
 *
 * Only registered when `SANITY_VISUAL_EDITING=true` (see astro.config.mjs).
 */
import type { APIRoute } from "astro";
import { DRAFT_MODE_COOKIE } from "@/lib/sanity/env";
import {
  draftCookieOptions,
  noStoreRedirect,
  safeRedirectPath,
} from "./shared";

export const prerender = false;

export const GET: APIRoute = ({ request, url, cookies }) => {
  // Use the same cookie attributes as when it was set, otherwise browsers
  // may ignore the deletion inside the Studio iframe
  cookies.delete(DRAFT_MODE_COOKIE, draftCookieOptions(request, url));

  return noStoreRedirect(
    safeRedirectPath(url.searchParams.get("redirect"), url),
  );
};
