/**
 * Sanity CLI configuration (used by `sanity dev`, `sanity build`, `sanity deploy`…).
 * Values come from the root `.env` file; see `.env.example`.
 */
import { defineCliConfig } from "sanity/cli";

const projectId = process.env.SANITY_STUDIO_PROJECT_ID;
const dataset = process.env.SANITY_STUDIO_DATASET || "production";

if (!projectId) {
  console.warn(
    "\n⚠️  SANITY_STUDIO_PROJECT_ID is not set. Copy .env.example to .env and add your project ID, or run `npm run setup`.\n",
  );
}

export default defineCliConfig({
  api: { projectId, dataset },

  // Optional: the *.sanity.studio hostname used by `npm run studio:deploy`,
  // e.g. SANITY_STUDIO_HOSTNAME="my-agency" → https://my-agency.sanity.studio
  studioHost: process.env.SANITY_STUDIO_HOSTNAME || undefined,

  deployment: {
    // Set after your first deploy so later deploys reuse the same Studio.
    appId: process.env.SANITY_STUDIO_APP_ID || undefined,
    // Keep the deployed Studio on the latest compatible Sanity version.
    autoUpdates: true,
  },

  // Extra React checks while running `sanity dev` (ignored in production builds).
  reactStrictMode: true,

  server: { port: 3333 },

  // The website's `public/` folder belongs to Astro, so don't copy it into the Studio build.
  vite: (config) => ({ ...config, publicDir: false }),
});
