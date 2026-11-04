/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

// Environment variables read from the root `.env` file (see `.env.example`)
interface ImportMetaEnv {
  /** Sanity project ID. Leave empty to run with the bundled demo content. */
  readonly PUBLIC_SANITY_PROJECT_ID?: string;
  /** Sanity dataset name (default "production") */
  readonly PUBLIC_SANITY_DATASET?: string;
  /** Sanity API version date (default "2025-02-19") */
  readonly PUBLIC_SANITY_API_VERSION?: string;
  /** URL of Sanity Studio (default "http://localhost:3333") */
  readonly PUBLIC_SANITY_STUDIO_URL?: string;
  // SANITY_API_READ_TOKEN is NOT listed here on purpose: it is a secret read
  // from `astro:env/server` (see `env.schema` in astro.config.mjs).
  // SANITY_VISUAL_EDITING is only read by astro.config.mjs, which passes the
  // result to the site code as `__FOLEX_SERVER_OUTPUT__`.
  /** Studio-only settings (read by the Sanity CLI, listed for completeness) */
  readonly SANITY_STUDIO_PROJECT_ID?: string;
  readonly SANITY_STUDIO_DATASET?: string;
  readonly SANITY_STUDIO_PREVIEW_URL?: string;
}

/** True on the preview server (set by `vite.define` in astro.config.mjs) */
declare const __FOLEX_SERVER_OUTPUT__: boolean;

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    /** True when this request shows drafts (valid draft-mode cookie) */
    preview: boolean;
  }
}
