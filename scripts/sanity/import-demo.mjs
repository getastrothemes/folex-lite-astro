#!/usr/bin/env node
/**
 * Import the demo content into your Sanity project.
 *
 * Uploads every document and image of `sanity/seed/demo-content.json`
 * (pages, portfolio projects, services, menus, footer and site settings)
 * with the Sanity CLI.
 *
 * Usage:
 *   npm run import-demo               # create or REPLACE the demo documents
 *   npm run import-demo -- --missing  # only create documents that don't exist
 *
 * Requirements:
 * - `SANITY_STUDIO_PROJECT_ID` (or `PUBLIC_SANITY_PROJECT_ID`) in `.env`
 * - Being logged in to Sanity: run `npx sanity login` once.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

// ---------- Paths & options ----------
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const SEED_FILE = path.join(ROOT, "sanity", "seed", "demo-content.json");

const args = process.argv.slice(2);
const onlyMissing = args.includes("--missing");

const red = (value) => `\x1b[31m${value}\x1b[0m`;
const green = (value) => `\x1b[32m${value}\x1b[0m`;
const yellow = (value) => `\x1b[33m${value}\x1b[0m`;

if (args.includes("--help") || args.includes("-h")) {
  console.log(`Import the demo content into your Sanity dataset.

  npm run import-demo               Create or replace the demo documents
  npm run import-demo -- --missing  Only create documents that don't exist yet`);
  process.exit(0);
}

// ---------- Read .env (no dependencies) ----------

/** Minimal `.env` parser: KEY=value lines, `#` comments, optional quotes */
const readEnvFile = (file) => {
  if (!fs.existsSync(file)) return {};
  const values = {};
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*(?:export\s+)?([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    let value = match[2].trim();
    if (/^(["']).*\1$/.test(value)) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, ""); // inline comment
    }
    values[match[1]] = value;
  }
  return values;
};

// Real environment variables win over the `.env` file
const env = { ...readEnvFile(path.join(ROOT, ".env")), ...process.env };

const projectId = env.SANITY_STUDIO_PROJECT_ID || env.PUBLIC_SANITY_PROJECT_ID;
const dataset =
  env.SANITY_STUDIO_DATASET || env.PUBLIC_SANITY_DATASET || "production";

if (!projectId) {
  console.error(
    red("Missing Sanity project ID.") +
      "\nAdd SANITY_STUDIO_PROJECT_ID=<your project id> to the .env file" +
      " (run `npm run setup` or copy .env.example), then try again.",
  );
  process.exit(1);
}

if (!fs.existsSync(SEED_FILE)) {
  console.error(
    red(`Demo content not found: ${path.relative(ROOT, SEED_FILE)}`) +
      "\nRun `node scripts/sanity/build-seed.mjs` to generate it.",
  );
  process.exit(1);
}

// ---------- Prepare the NDJSON file ----------

/**
 * The seed uses paths relative to the project (`image@file://./src/...`).
 * The Sanity CLI needs absolute `file://` URLs, so convert every image.
 */
const missingFiles = [];
const resolveAssets = (value) => {
  if (Array.isArray(value)) return value.map(resolveAssets);
  if (!value || typeof value !== "object") return value;

  const result = {};
  for (const [key, child] of Object.entries(value)) {
    if (key === "_sanityAsset" && typeof child === "string") {
      const [kind, location] = child.split(/@(.+)/);
      const relativePath = location.replace(/^file:\/\/\.?\/?/, "");
      const absolutePath = path.resolve(ROOT, relativePath);
      if (!fs.existsSync(absolutePath)) missingFiles.push(relativePath);
      result[key] = `${kind}@${pathToFileURL(absolutePath).href}`;
    } else {
      result[key] = resolveAssets(child);
    }
  }
  return result;
};

const { documents = [] } = JSON.parse(fs.readFileSync(SEED_FILE, "utf8"));
const ndjson = documents
  .map((doc) => JSON.stringify(resolveAssets(doc)))
  .join("\n");

if (missingFiles.length) {
  console.error(
    red("These image files are missing:\n- ") + missingFiles.join("\n- "),
  );
  process.exit(1);
}

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "sanity-demo-"));
const tempFile = path.join(tempDir, "demo-content.ndjson");
fs.writeFileSync(tempFile, ndjson + "\n");

// ---------- Run the Sanity CLI ----------

const mode = onlyMissing ? "--missing" : "--replace";
console.log(
  `Importing ${documents.length} documents into project "${projectId}", dataset "${dataset}"...`,
);
if (!onlyMissing) {
  console.log(
    yellow(
      "Existing demo documents with the same IDs will be replaced." +
        " Use `npm run import-demo -- --missing` to keep your edits.",
    ),
  );
}

const result = spawnSync(
  "npx",
  [
    "sanity",
    "dataset",
    "import",
    tempFile,
    "--dataset",
    dataset,
    "--project",
    projectId,
    mode,
  ],
  {
    cwd: ROOT,
    stdio: "inherit",
    // `npx` is a .cmd file on Windows and needs a shell there
    shell: process.platform === "win32",
  },
);

fs.rmSync(tempDir, { recursive: true, force: true });

if (result.status !== 0) {
  console.error(
    red("\nImport failed.") +
      "\nCheck that:" +
      "\n- you are logged in: run `npx sanity login`" +
      `\n- the project ID "${projectId}" is correct and you have access to it` +
      `\n- the dataset "${dataset}" exists (create it with \`npx sanity dataset create ${dataset}\`)`,
  );
  process.exit(result.status || 1);
}

console.log(
  green("\nDemo content imported!") +
    " Open the Studio (`npm run studio`) to edit it.",
);
