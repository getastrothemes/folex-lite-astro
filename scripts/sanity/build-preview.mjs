#!/usr/bin/env node
// scripts/sanity/build-preview.mjs
//
// `npm run build:preview` builds the preview server: a small Node server that
// shows unpublished (draft) content inside Sanity Studio's Presentation tool.
// Start it with `npm run start:preview`. The normal `npm run build` always
// makes the static site, so a local `.env` can never change your live site.

import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const PROJECT_ROOT = path.resolve(path.dirname(__filename), "..", "..");

const env = {
  ...process.env,
  SANITY_VISUAL_EDITING: "true",
  SANITY_PREVIEW_BUILD: "true",
};

for (const args of [["run", "toml:watch"], ["exec", "astro", "build"]]) {
  const result = spawnSync("npm", args, {
    cwd: PROJECT_ROOT,
    env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("\nPreview server built. Start it with: npm run start:preview");
