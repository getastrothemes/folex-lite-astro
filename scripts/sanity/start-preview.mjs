#!/usr/bin/env node
// scripts/sanity/start-preview.mjs
//
// `npm run start:preview` starts the preview server built by
// `npm run build:preview`. The private read token is read when the server
// starts (never written into the build), so this loads `.env` first.
// Variables already set by your host win over the `.env` file.

import path from "node:path";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const PROJECT_ROOT = path.resolve(path.dirname(__filename), "..", "..");
const ENV_FILE = path.join(PROJECT_ROOT, ".env");
const ENTRY = path.join(PROJECT_ROOT, "dist", "server", "entry.mjs");

if (existsSync(ENV_FILE)) {
  for (const line of readFileSync(ENV_FILE, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match || match[1] in process.env) continue;
    process.env[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}

if (!existsSync(ENTRY)) {
  console.error(
    "The preview server is not built yet. Run `npm run build:preview` first.",
  );
  process.exit(1);
}

await import(pathToFileURL(ENTRY).href);
