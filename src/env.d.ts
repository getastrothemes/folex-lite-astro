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
  /** PRIVATE Viewer token, used only by the preview server to read drafts */
  readonly SANITY_API_READ_TOKEN?: string;
  /** "true" builds the preview server (drafts + visual editing) */
  readonly SANITY_VISUAL_EDITING?: string;
  /** Studio-only settings (read by the Sanity CLI, listed for completeness) */
  readonly SANITY_STUDIO_PROJECT_ID?: string;
  readonly SANITY_STUDIO_DATASET?: string;
  readonly SANITY_STUDIO_PREVIEW_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare namespace App {
  interface Locals {
    /** True when this request shows drafts (valid draft-mode cookie) */
    preview: boolean;
  }
}
