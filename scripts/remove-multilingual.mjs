// scripts/cleanup-i18n.mjs
import path from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";

// --------- Cross-platform root ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, "..");

// --------- Absolute paths ----------
const CONTENT_DIR = path.resolve(PROJECT_ROOT, "src", "content");
const CONFIG_DIR = path.resolve(PROJECT_ROOT, "src", "config");
const I18N_DIR = path.resolve(PROJECT_ROOT, "src", "i18n");
const LANGUAGE_FILE = path.join(CONFIG_DIR, "language.json");
const LANG_FILE = path.join(CONFIG_DIR, "language.json");
const ASTRO_CONFIG_FILE = path.resolve(
  PROJECT_ROOT,
  ".astro",
  "config.generated.json",
);

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

async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

// ---------------- Colors ----------------
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

const log = (message, color = "reset") => {
  console.log(`${colors[color] ?? colors.reset}${message}${colors.reset}`);
};

// ---------------- Core helpers ----------------
const deleteMatchingFolders = async (baseDir, targetFolderName) => {
  // If baseDir doesn't exist, just skip
  if (!(await pathExists(baseDir))) return;

  try {
    const entries = await fs.readdir(baseDir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const fullPath = path.join(baseDir, entry.name);

      if (entry.name === targetFolderName) {
        await fs.rm(fullPath, { recursive: true, force: true });
        log(`Deleted folder: ${fullPath}`, "green");
      } else {
        await deleteMatchingFolders(fullPath, targetFolderName);
      }
    }
  } catch (err) {
    log(
      `Error processing directory ${baseDir}: ${err?.message ?? String(err)}`,
      "red",
    );
  }
};

// ---------------- Tasks ----------------
async function cleanupContentDirectories(NON_DEFAULT_LANGS) {
  log("Cleaning up content directories...", "cyan");

  if (!(await pathExists(CONTENT_DIR))) {
    log(`⚠️ Content dir not found: ${CONTENT_DIR} (skipping)`, "yellow");
    return;
  }

  // Delete each non-default language folder under src/content/**/
  for (const lang of NON_DEFAULT_LANGS) {
    if (!lang?.contentDir) continue;
    await deleteMatchingFolders(CONTENT_DIR, lang.contentDir);
  }

  log("Content directories cleanup completed.", "green");
}

async function updateLanguageConfig(DEFAULT_LANG, languages) {
  log("Updating language.json...", "cyan");

  const defaultLangEntries = languages.filter(
    (l) => l?.languageCode === DEFAULT_LANG,
  );

  if (defaultLangEntries.length === 0) {
    log(
      `⚠️ No language entry found for defaultLanguage="${DEFAULT_LANG}". Writing unchanged file.`,
      "yellow",
    );
    return;
  }

  await fs.writeFile(
    LANGUAGE_FILE,
    JSON.stringify(defaultLangEntries, null, 2),
    "utf8",
  );
  log(`Updated language.json to only include: ${DEFAULT_LANG}`, "green");
}

async function cleanupMenuFiles() {
  log("Cleaning up menu files...", "cyan");

  if (!(await pathExists(CONFIG_DIR))) {
    log(`⚠️ Config dir not found: ${CONFIG_DIR} (skipping)`, "yellow");
    return;
  }

  const files = await fs.readdir(CONFIG_DIR);

  await Promise.all(
    files
      .filter((file) => file.startsWith("menu.") && file !== "menu.en.json")
      .map(async (file) => {
        const filePath = path.join(CONFIG_DIR, file);
        await fs.unlink(filePath);
        log(`Deleted file: ${filePath}`, "green");
      }),
  );

  log("Menu files cleanup completed.", "green");
}

async function cleanupI18nFiles() {
  log("Cleaning up i18n files...", "cyan");

  if (!(await pathExists(I18N_DIR))) {
    log(`⚠️ i18n dir not found: ${I18N_DIR} (skipping)`, "yellow");
    return;
  }

  const files = await fs.readdir(I18N_DIR);

  await Promise.all(
    files
      .filter((file) => file !== "en.json")
      .map(async (file) => {
        const filePath = path.join(I18N_DIR, file);
        await fs.unlink(filePath);
        log(`Deleted file: ${filePath}`, "green");
      }),
  );

  log("i18n files cleanup completed.", "green");
}

// ---------------- Runner ----------------
async function runCleanup() {
  log("Starting cleanup process...", "blue");

  try {
    const [languages, config] = await Promise.all([
      readJsonFile(LANG_FILE),
      readJsonFile(ASTRO_CONFIG_FILE),
    ]);

    const DEFAULT_LANG = config?.settings?.multilingual?.defaultLanguage;
    if (!DEFAULT_LANG) {
      log(
        `❌ Could not read settings.multilingual.defaultLanguage from ${ASTRO_CONFIG_FILE}`,
        "red",
      );
      process.exitCode = 1;
      return;
    }

    const NON_DEFAULT_LANGS = (
      Array.isArray(languages) ? languages : []
    ).filter(
      (item) => item?.languageCode && item.languageCode !== DEFAULT_LANG,
    );

    await cleanupContentDirectories(NON_DEFAULT_LANGS);
    await updateLanguageConfig(
      DEFAULT_LANG,
      Array.isArray(languages) ? languages : [],
    );
    await cleanupMenuFiles();
    await cleanupI18nFiles();

    log("Cleanup process completed successfully.", "green");
  } catch (err) {
    log(`Error during cleanup process: ${err?.message ?? String(err)}`, "red");
    process.exitCode = 1;
  }
}

runCleanup();
