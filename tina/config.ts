import { defineConfig } from "tinacms";
import {
  homepageCollection,
  pagesCollection,
  portfolioCollection,
  servicesCollection,
} from "./collections/content";
import { sectionCollections } from "./collections/sections";
import { settingsCollections } from "./collections/settings";
import { LANGUAGES } from "./site";

// Tina CMS configuration. See README.md ("Tina CMS") for setup.
//
// - Local editing (`npm run dev`) needs no account: Tina saves straight to the
//   files in this repository.
// - Editing the deployed site uses Tina Cloud. Set PUBLIC_TINA_CLIENT_ID and
//   TINA_TOKEN in your hosting provider (see .env.example).

const branch =
  process.env.TINA_BRANCH ||
  process.env.GITHUB_BRANCH ||
  process.env.GITHUB_HEAD_REF || // GitHub Actions (pull requests)
  process.env.GITHUB_REF_NAME || // GitHub Actions
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.CF_PAGES_BRANCH ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,
  // Public: identifies your Tina Cloud project.
  clientId: process.env.PUBLIC_TINA_CLIENT_ID || null,
  // Private: read-only content token. Only used at build time and on the server.
  token: process.env.TINA_TOKEN || null,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },

  // Images are stored in src/assets/images so the theme can optimize them.
  // Tina saves them as "/images/...", the path format the theme already uses.
  media: {
    tina: {
      publicFolder: "src/assets",
      mediaRoot: "images",
    },
  },

  schema: {
    collections: [
      homepageCollection,
      ...LANGUAGES.map(pagesCollection),
      ...LANGUAGES.map(portfolioCollection),
      ...LANGUAGES.map(servicesCollection),
      ...sectionCollections,
      ...settingsCollections,
    ],
  },
});
