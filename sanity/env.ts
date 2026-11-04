/**
 * Studio environment variables.
 *
 * The Sanity CLI only exposes variables that start with `SANITY_STUDIO_` to the
 * Studio, and it replaces them at build time. Keep every `process.env.*` read
 * written out in full (no destructuring) so the replacement keeps working.
 *
 * Set these in the root `.env` file (see `.env.example`), or run `npm run setup`.
 */

/** Sanity project ID, e.g. "abcd1234". Find it at https://www.sanity.io/manage */
export const projectId: string = process.env.SANITY_STUDIO_PROJECT_ID || "";

/** Dataset name. Most projects use "production". */
export const dataset: string =
  process.env.SANITY_STUDIO_DATASET || "production";

/** Website URL the Presentation tool loads, e.g. "http://localhost:4321" or "https://example.com". */
export const previewUrl: string = (
  process.env.SANITY_STUDIO_PREVIEW_URL || "http://localhost:4321"
).replace(/\/+$/, "");

/** API version used by Studio queries (slug checks, structure lists). */
export const apiVersion = "2025-02-19";

/** Friendly help text shown when the project ID is missing. */
export const missingProjectIdMessage = [
  "Missing SANITY_STUDIO_PROJECT_ID.",
  "Copy .env.example to .env and add your Sanity project ID,",
  "or run `npm run setup` to create a project and write .env for you.",
].join(" ");

/**
 * Returns the project ID, or throws a clear error when it is missing.
 * Used by `sanity.config.ts`, where a missing ID would otherwise show a
 * confusing error in the browser.
 */
export function assertProjectId(): string {
  if (!projectId) {
    throw new Error(missingProjectIdMessage);
  }
  return projectId;
}
