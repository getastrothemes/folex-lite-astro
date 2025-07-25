import toml from "toml";
import path from "path";
import fs from "fs/promises";
import matter from "gray-matter";
import { readFileSync } from "fs";
import { parseStringPromise, Builder } from "xml2js";
import languagesJSON from "../src/config/language.json" with { type: "json" };

// Constants
const DIST_FOLDER = "./dist";
const CONTENT_FOLDER = "./src/content";
const SITEMAP_FILE_PATTERN = /^sitemap-\d+\.xml$/;

// Parse TOML Configuration
function parseTomlToJson(filePath) {
  try {
    const content = readFileSync(filePath, "utf8");
    if (!content) throw new Error(`File not found: ${filePath}`);
    const parsedToml = toml.parse(content);
    return JSON.parse(JSON.stringify(parsedToml, null, 2));
  } catch (error) {
    console.error(`Error parsing TOML file: ${filePath}`, error);
    throw error;
  }
}

// Configuration
const config = parseTomlToJson(
  path.join(process.cwd(), "src", "config", "config.toml"),
);

const settings = {
  ...config.settings.multilingual,
  languages: [...languagesJSON],
};

const EXCLUDE_FOLDERS = ["widgets", "sections", "author"];
const INCLUDE_FOLDERS = config.seo.sitemap.exclude || [];

// Helper: Get All Sitemap Files
async function getSitemapFiles() {
  try {
    const files = await fs.readdir(DIST_FOLDER);
    return files
      .filter((file) => SITEMAP_FILE_PATTERN.test(file))
      .map((file) => path.join(DIST_FOLDER, file));
  } catch (error) {
    console.error("Error reading sitemap files:", error);
    throw error;
  }
}

// Helper: Normalize Path
function normalizedPath(filePath) {
  return path.posix.join(...filePath.split(path.sep));
}

// Helper: Generate Slug
function getSlug(filePath, metadata) {
  const fileName = path.basename(filePath, path.extname(filePath));
  const parentFolder = filePath.split("/")[2];
  const slugPath = path.join(parentFolder, metadata.originalSlug || fileName);
  return normalizedPath(fileName !== "-index" ? slugPath : parentFolder);
}

// Helper: Generate URL
function generateUrl(filePath, metadata) {
  const langCode = getLanguageCode(filePath);
  if (!langCode) return null;
  const slug = getSlug(filePath, metadata);
  const isDefaultLang = langCode === settings.defaultLanguage;

  // Construct URL
  return isDefaultLang && !settings.showDefaultLangInUrl
    ? `/${slug}`
    : `/${langCode}/${slug}`.replace(/\/+/g, "/");
}

// Helper: Get Language Code
function getLanguageCode(filePath) {
  const language = settings.languages.find((lang) =>
    filePath.includes(`/${lang.contentDir}/`),
  );
  return language ? language.languageCode : null;
}

// Helper: Process File Paths
function processFilePaths(filePaths) {
  const urlMappings = [];
  for (const [filePath, metadata] of Object.entries(filePaths)) {
    let url = generateUrl(filePath, metadata);

    // Exclude URLs based on folders
    if (EXCLUDE_FOLDERS.some((folder) => url?.includes(folder))) {
      continue;
    }

    // Align URLs with sitemap structure
    if (url) {
      if (url.includes("/pages/")) url = url.replace("/pages/", "/");
      if (url.includes("/homepage")) url = url.replace("/homepage", "/");

      // Include URLs based on included folders
      if (INCLUDE_FOLDERS.some((folder) => url.includes(folder))) {
        url = filePath.split("/")[2];
      }

      const obj = { filePath, slug: url, data: metadata };
      if (
        metadata.draft ||
        metadata.excludeFromSitemap ||
        INCLUDE_FOLDERS.some((folder) => url.includes(folder))
      ) {
        if (!urlMappings.some((item) => item.filePath === obj.filePath)) {
          urlMappings.push(obj);
        }
      }
    }
  }
  return urlMappings;
}

// Helper: Read Content Frontmatter
async function getContentFrontmatter(folder = CONTENT_FOLDER) {
  const frontmatterMap = {};

  async function readDirectory(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        await readDirectory(entryPath);
      } else if (entry.isFile() && /\.(md|mdx)$/.test(entry.name)) {
        try {
          const content = await fs.readFile(entryPath, "utf-8");
          const { data } = matter(content);
          if (data) {
            frontmatterMap[normalizedPath(entryPath)] = {
              excludeFromSitemap: data.excludeFromSitemap || false,
              draft: data.draft || false,
              originalSlug:
                data.data?.customSlug ||
                data.id?.replace(/\.mdx?$/, "") ||
                null,
            };
          }
        } catch (error) {
          console.error(`Error reading file ${entryPath}:`, error);
        }
      }
    }
  }

  await readDirectory(folder);
  return frontmatterMap;
}

// Helper: Check if the dist folder exists
async function checkDistFolder() {
  try {
    await fs.access(DIST_FOLDER);
  } catch (error) {
    console.error(
      `❌ The 'dist' folder was not found at '${path.resolve(DIST_FOLDER)}'.\n` +
        `   Please ensure that the folder exists and contains the necessary files.\n` +
        `   If you are running a build process, make sure to execute it first.\n` +
        `   Example: Run 'npm run build' or 'yarn build' to generate the 'dist' folder.`,
    );
    process.exit(1); // Exit the script
  }
}

// Main: Process Sitemaps
async function processSitemaps() {
  try {
    await checkDistFolder(); // Ensure dist folder exists
    const sitemapFiles = await getSitemapFiles();
    const contentFrontmatter = await getContentFrontmatter();
    const draftPages = processFilePaths(contentFrontmatter);

    for (const sitemapFile of sitemapFiles) {
      const sitemapContent = await fs.readFile(sitemapFile, "utf-8");
      const sitemapObj = await parseStringPromise(sitemapContent, {
        explicitArray: false, // Simplifies the structure
        tagNameProcessors: [(name) => name.replace("xhtml:", "")], // Handle xhtml namespace
      });

      if (
        sitemapObj &&
        sitemapObj.urlset.url &&
        Array.isArray(sitemapObj.urlset.url)
      ) {
        const urls = Array.isArray(sitemapObj.urlset.url)
          ? sitemapObj.urlset.url
          : [sitemapObj.urlset.url];

        sitemapObj.urlset.url = urls.filter((url) => {
          const pathname = new URL(url.loc).pathname;
          return !draftPages.some((draft) =>
            pathname.includes("/" + draft.slug),
          );
        });

        const updatedSitemap = new Builder().buildObject(sitemapObj);
        const minifiedSitemap = updatedSitemap
          .replace(/(>)(\s+)(<)/g, "$1$3") // Remove spaces between tags
          .replace(/\s+(?=<)/g, ""); // Remove spaces before tags

        await fs.writeFile(sitemapFile, minifiedSitemap, "utf-8");
      }
    }

    console.log("✅ Sitemaps processed successfully.");
  } catch (error) {
    console.error("Error processing sitemaps:", error);
  }
}

// Run
processSitemaps();
