// scripts/generateFavicons.ts
import path from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";

import {
  getNodeImageAdapter,
  loadAndConvertToSvg,
} from "@realfavicongenerator/image-adapter-node";
import faviconGenerator from "@realfavicongenerator/generate-favicon";

// --- Cross-platform __dirname / project root ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, "..");

// Constants
const FAVICON_DIR = path.resolve(PROJECT_ROOT, "public", "images", "favicons");
const DEFAULT_TITLE = "Website";
const DEFAULT_FAVICON_IMAGE = "/images/default-favicon.png";
const CONFIG_PATH = path.resolve(
  PROJECT_ROOT,
  ".astro",
  "config.generated.json",
);

// Helper: Read config in a Node-version-friendly way
async function loadConfig() {
  // 1) Try native JSON import (Node 20+ typically)
  try {
    const mod = await import(CONFIG_PATH, { with: { type: "json" } });
    return mod.default ?? mod;
  } catch {
    // 2) Fallback to reading JSON from disk (works everywhere)
    const raw = await fs.readFile(CONFIG_PATH, "utf8");
    return JSON.parse(raw);
  }
}

async function ensureDirectoryExists(directoryPath) {
  await fs.mkdir(directoryPath, { recursive: true });
}

function resolveAssetPath(assetLike) {
  // You currently treat favicon paths as relative to ./src/assets
  // Keep same behavior, but do it safely.
  const cleaned = assetLike.startsWith("/") ? assetLike.slice(1) : assetLike;
  return path.resolve(PROJECT_ROOT, "src", "assets", cleaned);
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

// Main: Generate Favicons
async function generateFavicons() {
  try {
    const config = await loadConfig();

    const title = config?.site?.title || DEFAULT_TITLE;
    const faviconImage = config?.site?.favicon?.image || DEFAULT_FAVICON_IMAGE;

    const faviconImagePath = resolveAssetPath(faviconImage);

    if (!(await fileExists(faviconImagePath))) {
      throw new Error(
        `Favicon source image not found.\n` +
          `Expected at: ${faviconImagePath}\n` +
          `Config value: ${faviconImage}`,
      );
    }

    await ensureDirectoryExists(FAVICON_DIR);

    const imageAdapter = await getNodeImageAdapter();
    const masterIcon = {
      icon: await loadAndConvertToSvg(faviconImagePath),
    };

    const faviconSettings = {
      icon: {
        desktop: {
          regularIconTransformation: {
            type: faviconGenerator.IconTransformationType.None,
          },
          darkIconType: "regular",
          darkIconTransformation: {
            type: faviconGenerator.IconTransformationType.None,
          },
        },
        touch: {
          transformation: {
            type: faviconGenerator.IconTransformationType.Background,
            backgroundColor: "#ffffff",
            backgroundRadius: 0,
            imageScale: 0.7,
          },
          appTitle: title,
        },
        webAppManifest: {
          transformation: {
            type: faviconGenerator.IconTransformationType.Background,
            backgroundColor: "#ffffff",
            backgroundRadius: 0,
            imageScale: 0.8,
          },
          backgroundColor: "#ffffff",
          themeColor: "#ffffff",
          name: title,
          shortName: title,
        },
      },
      path: "/images/favicons/",
    };

    const files = await faviconGenerator.generateFaviconFiles(
      masterIcon,
      faviconSettings,
      imageAdapter,
    );

    await Promise.all(
      Object.entries(files).map(async ([fileName, fileContents]) => {
        const outPath = path.join(FAVICON_DIR, fileName);
        await fs.writeFile(outPath, fileContents);
        console.log(`Saved: ${outPath}`);
      }),
    );

    console.log("Favicons generated successfully.");
  } catch (error) {
    console.error("Error generating favicons:", error);
    process.exitCode = 1;
  }
}

generateFavicons();
