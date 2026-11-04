/**
 * GET /api/draft-mode/enable
 *
 * Sanity Studio's Presentation tool opens this URL (with a one-time secret)
 * when an editor starts previewing. We check the secret with Sanity, then
 * set the draft-mode cookie so the site shows unpublished changes, and
 * redirect to the page the editor wants to see.
 *
 * Only registered when `SANITY_VISUAL_EDITING=true` (see astro.config.mjs).
 */
import type { APIRoute } from "astro";
import { createClient } from "@sanity/client";
import { validatePreviewUrl } from "@sanity/preview-url-secret";
import {
  DRAFT_MODE_COOKIE,
  apiVersion,
  createDraftModeCookieValue,
  dataset,
  projectId,
  readToken,
} from "@/lib/sanity/env";
import {
  draftCookieOptions,
  noStoreRedirect,
  safeRedirectPath,
  textResponse,
} from "./shared";

export const prerender = false;

export const GET: APIRoute = async ({ request, url, cookies }) => {
  // Preview needs both a project and a private read token
  if (!projectId || !readToken) {
    return textResponse(
      500,
      "Preview is not set up yet. Add PUBLIC_SANITY_PROJECT_ID and SANITY_API_READ_TOKEN to your .env file, then restart the preview server.",
    );
  }

  // A client with the token, used only to verify the secret from the Studio
  const client = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: readToken,
  });

  // Ask Sanity whether the secret in the URL is real (a wrong token or
  // project ID makes this request fail, so explain that instead of crashing)
  let result: Awaited<ReturnType<typeof validatePreviewUrl>>;
  try {
    result = await validatePreviewUrl(client, request.url);
  } catch (error) {
    console.error("[sanity] Could not validate the preview link:", error);
    return textResponse(
      500,
      "Could not reach Sanity to check the preview link. Make sure PUBLIC_SANITY_PROJECT_ID, PUBLIC_SANITY_DATASET and SANITY_API_READ_TOKEN are correct.",
    );
  }

  const { isValid, redirectTo } = result;
  if (!isValid) {
    return textResponse(401, "Invalid or expired preview link.");
  }

  // Store a signed, time-limited value (never the token itself). The
  // middleware checks the signature and the age on every request.
  cookies.set(
    DRAFT_MODE_COOKIE,
    await createDraftModeCookieValue(),
    draftCookieOptions(request, url),
  );

  return noStoreRedirect(safeRedirectPath(redirectTo, url));
};
