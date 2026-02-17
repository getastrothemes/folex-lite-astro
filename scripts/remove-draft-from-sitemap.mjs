// scripts/process-sitemaps.mjs
import path from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { parseStringPromise, Builder } from "xml2js";

// --------- Cross-platform root ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, "..");

// --------- Paths (absolute) ----------
const DIST_FOLDER = path.resolve(PROJECT_ROOT, "dist");
const CONTENT_FOLDER = path.resolve(PROJECT_ROOT, "src", "content");
const LANG_FILE = path.resolve(PROJECT_ROOT, "src", "config", "language.json");
const ASTRO_CONFIG_FILE = path.resolve(PROJECT_ROOT, ".astro", "config.generated.json");

const SITEMAP_FILE_PATTERN = /^sitemap-\d+\.xml$/;

// --------- JSON load (Node-safe) ----------
async function readJsonFile(filePath) {
  try {
    const mod = await import(filePath, { with: { type: "json" } });
    return mod.default ?? mod;
  } catch {
    try {
      const mod = await import(filePath, { assert: { type: "json" } });
      return mod.default ?? mod;
    } catch {
      const raw = await fs.readFile(filePath, "utf8");
      return JSON.parse(raw);
    }
  }
}

// --------- Helpers ----------
async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

// Always return POSIX-style paths for keys/URLs
function toPosix(p) {
  return p.split(path.sep).join(path.posix.sep);
}

// Safe URL pathname extraction (handles absolute + relative)
function safePathname(loc) {
  if (!loc || typeof loc !== "string") return null;
  try {
    // If it's absolute
    return new URL(loc).pathname;
  } catch {
    // If it's relative, parse with dummy base
    try {
      return new URL(loc, "https://example.com").pathname;
    } catch {
      return null;
    }
  }
}

// Recursively walk content and read frontmatter
async function getContentFrontmatter(folder = CONTENT_FOLDER) {
  const frontmatterMap = {};

  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
        continue;
      }
      if (!entry.isFile() || !/\.(md|mdx)$/i.test(entry.name)) continue;

      try {
        const content = await fs.readFile(full, "utf8");
        const { data } = matter(content);

        const key = toPosix(full); // consistent key regardless of OS

        frontmatterMap[key] = {
          excludeFromSitemap: Boolean(data?.excludeFromSitemap),
          draft: Boolean(data?.draft),
          originalSlug: typeof data?.id === "string" ? data.id : null,
          customSlug: typeof data?.customSlug === "string" ? data.customSlug : null,
        };
      } catch (err) {
        console.error(`Error reading file ${full}:`, err);
      }
    }
  }

  await walk(folder);
  return frontmatterMap;
}

// Determine language by contentDir in the file path
function getLanguageCode(filePathPosix, languages) {
  const match = languages.find((lang) => filePathPosix.includes(`/${lang.contentDir}/`));
  return match?.languageCode ?? null;
}

// Determine "section" (blog, pages, docs...) from src/content/<section>/<lang>/*
function getTopSection(filePathPosix) {
  // filePathPosix contains .../src/content/<section>/...
  const parts = filePathPosix.split("/");

  const idx = parts.lastIndexOf("content");
  if (idx === -1) return null;

  return parts[idx + 1] ?? null;
}

// Build slug: <section>/<originalSlug or filename> (handles -index)
function getSlug(filePathPosix, metadata) {
  const fileName = path.posix.basename(filePathPosix, path.posix.extname(filePathPosix));
  const section = getTopSection(filePathPosix);

  // fallback if structure isn't src/content/<section>/...
  const base = section ? section : "";

  const rawSlug = metadata?.originalSlug || fileName;
  if (fileName === "-index") return base || "";

  // join with posix so URLs are correct on Windows too
  return path.posix.join(base, rawSlug).replace(/\/+/g, "/");
}

// Generate URL per multilingual settings
function generateUrl(filePathPosix, metadata, settings) {
  const langCode = getLanguageCode(filePathPosix, settings.languages);
  if (!langCode) return null;

  const slug = getSlug(filePathPosix, metadata);
  const isDefault = langCode === settings.defaultLanguage;

  const urlPath =
    isDefault && !settings.showDefaultLangInUrl
      ? `/${slug}`
      : `/${langCode}/${slug}`;

  return urlPath.replace(/\/+/g, "/");
}

function buildExcludedFolders(config) {
  const fromConfig = Array.isArray(config?.seo?.sitemap?.exclude) ? config.seo.sitemap.exclude : [];
  return ["widgets", "sections", "author", ...fromConfig];
}

async function getSitemapFiles() {
  const files = await fs.readdir(DIST_FOLDER);
  return files
    .filter((f) => SITEMAP_FILE_PATTERN.test(f))
    .map((f) => path.join(DIST_FOLDER, f));
}

// ---------------- Main ----------------
async function processSitemaps() {
  try {
    if (!(await pathExists(DIST_FOLDER))) {
      console.error(
        `❌ The 'dist' folder was not found at '${DIST_FOLDER}'.\n` +
          `   Run your build first (e.g., npm run build).`,
      );
      process.exitCode = 1;
      return;
    }

    const languagesJSON = await readJsonFile(LANG_FILE);
    const config = await readJsonFile(ASTRO_CONFIG_FILE);

    const settings = {
      ...(config?.settings?.multilingual ?? {}),
      languages: Array.isArray(languagesJSON) ? [...languagesJSON] : [],
    };

    const EXCLUDE_FOLDERS = buildExcludedFolders(config);

    const sitemapFiles = await getSitemapFiles();
    const contentFrontmatter = await getContentFrontmatter();

    // Precompute excluded/draft URLs from content
    const excludedUrlSet = new Set();

    for (const [filePath, meta] of Object.entries(contentFrontmatter)) {
      const filePathPosix = toPosix(filePath);
      const url = generateUrl(filePathPosix, meta, settings);

      if (!url) continue;

      // Normalize to match sitemap paths
      let norm = url;
      if (norm.includes("/pages/")) norm = norm.replace("/pages/", "/");
      if (norm.includes("/homepage")) norm = norm.replace("/homepage", "/");

      // If draft/excluded, we mark it for removal
      if (meta?.draft || meta?.excludeFromSitemap) {
        excludedUrlSet.add(meta.customSlug || norm);
      }
    }

    for (const sitemapFile of sitemapFiles) {
      const sitemapContent = await fs.readFile(sitemapFile, "utf8");

      const sitemapObj = await parseStringPromise(sitemapContent, {
        explicitArray: false,
        tagNameProcessors: [(name) => name.replace("xhtml:", "")],
      });

      const urlset = sitemapObj?.urlset;
      if (!urlset?.url) continue;

      const urls = Array.isArray(urlset.url) ? urlset.url : [urlset.url];

      const filtered = urls.filter((u) => {
        const pathname = safePathname(u?.loc);
        if (!pathname) return true; // if we can't parse it, don't delete it

        // Remove "-index" pages
        if (pathname.includes("-index")) return false;

        // Exclude folders
        if (EXCLUDE_FOLDERS.some((folder) => pathname.includes(folder))) return false;

        // Remove draft/excluded URLs
        // Match on either customSlug or generated url path
        for (const bad of excludedUrlSet) {
          if (bad && pathname.includes(bad)) return false;
        }

        return true;
      });

      sitemapObj.urlset.url = filtered;

      const updated = new Builder().buildObject(sitemapObj);
      const minified = updated
        .replace(/(>)(\s+)(<)/g, "$1$3")
        .replace(/\s+(?=<)/g, "");

      await fs.writeFile(sitemapFile, minified, "utf8");
    }

    console.log("✅ Sitemaps processed successfully.");
  } catch (error) {
    console.error("Error processing sitemaps:", error);
    process.exitCode = 1;
  }
}

processSitemaps();
