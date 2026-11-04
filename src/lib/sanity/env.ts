/**
 * Sanity environment settings for the website.
 *
 * Every value comes from the root `.env` file (see `.env.example`). When
 * `PUBLIC_SANITY_PROJECT_ID` is empty the site runs in "demo mode": it reads
 * the bundled demo content (`sanity/seed/demo-content.json`) instead of the
 * Sanity API, so the theme still builds and looks like the original.
 */

// Reads a private (server-only) variable. Astro exposes `.env` values through
// `import.meta.env`; on the Node preview server real environment variables
// (set by the host) live in `process.env`, so we check both.
const serverEnv = (value: string | undefined, name: string) =>
  value ||
  (typeof process !== "undefined" ? process.env?.[name] : undefined) ||
  "";

// Public values (prefixed with PUBLIC_) are safe to use anywhere
export const projectId: string = (
  import.meta.env.PUBLIC_SANITY_PROJECT_ID ||
  serverEnv(undefined, "PUBLIC_SANITY_PROJECT_ID")
).trim();

export const dataset: string =
  (
    import.meta.env.PUBLIC_SANITY_DATASET ||
    serverEnv(undefined, "PUBLIC_SANITY_DATASET")
  ).trim() || "production";

// 2025-02-19 is the first API version where "published" is the default
// perspective, and it supports the "drafts" perspective used for previews
export const apiVersion: string =
  (
    import.meta.env.PUBLIC_SANITY_API_VERSION ||
    serverEnv(undefined, "PUBLIC_SANITY_API_VERSION")
  ).trim() || "2025-02-19";

// Where Sanity Studio runs (used for visual editing and "Open Studio" links)
export const studioUrl: string = (
  (
    import.meta.env.PUBLIC_SANITY_STUDIO_URL ||
    serverEnv(undefined, "PUBLIC_SANITY_STUDIO_URL")
  ).trim() || "http://localhost:3333"
).replace(/\/+$/, "");

// True when a Sanity project is connected; false means demo mode
export const isSanityConfigured: boolean = projectId.length > 0;

/**
 * Viewer token used ONLY by the preview server to read drafts.
 * Never import this into client-side scripts.
 */
export const readToken: string = serverEnv(
  import.meta.env.SANITY_API_READ_TOKEN,
  "SANITY_API_READ_TOKEN",
).trim();

// `SANITY_VISUAL_EDITING=true` builds the site as a Node server (preview mode)
export const isServerOutput: boolean =
  serverEnv(import.meta.env.SANITY_VISUAL_EDITING, "SANITY_VISUAL_EDITING") ===
  "true";

// Draft previews need the server output, a connected project and a token
export const visualEditingEnabled: boolean =
  isServerOutput && isSanityConfigured && readToken.length > 0;

// Name of the cookie that turns draft mode on for one browser
export const DRAFT_MODE_COOKIE = "folex-sanity-preview";

/**
 * The value stored in the draft-mode cookie: a SHA-256 hash of the read token.
 * The token itself never leaves the server, but the middleware can still check
 * that the cookie was set by our own `/api/draft-mode/enable` endpoint.
 */
let draftModeSecret: Promise<string> | undefined;
export const getDraftModeSecret = (): Promise<string> => {
  draftModeSecret ??= (async () => {
    if (!readToken) return "";
    const bytes = new TextEncoder().encode(readToken);
    const hash = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(hash))
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  })();
  return draftModeSecret;
};
