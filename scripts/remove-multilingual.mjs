import path from "path";
import fs from "fs/promises";
import languages from "../src/config/language.json" with { type: "json" };

// Constants
const CONTENT_DIR = "src/content";
const CONFIG_DIR = "src/config";
const I18N_DIR = "src/i18n";
const LANGUAGE_FILE = path.join(CONFIG_DIR, "language.json");

// Filter languages
const ENGLISH_LANG = languages.filter((item) => item.languageCode === "en");
const NON_ENGLISH_LANGS = languages.filter(
  (item) => item.languageCode !== "en",
);

// Utility: Colorize console logs
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
  console.log(`${colors[color]}${message}${colors.reset}`);
};

// Updated tasks with colored logs
const deleteMatchingFolders = async (baseDir, targetFolderName) => {
  try {
    const entries = await fs.readdir(baseDir, { withFileTypes: true });

    await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(baseDir, entry.name);

        if (entry.isDirectory()) {
          if (entry.name === targetFolderName) {
            await fs.rm(fullPath, { recursive: true, force: true });
            log(`Deleted folder: ${fullPath}`, "green");
          } else {
            // Recurse into subdirectories
            await deleteMatchingFolders(fullPath, targetFolderName);
          }
        }
      }),
    );
  } catch (err) {
    log(`Error processing directory ${baseDir}: ${err.message}`, "red");
  }
};

const cleanupContentDirectories = async () => {
  try {
    log("Cleaning up content directories...", "cyan");
    await Promise.all(
      NON_ENGLISH_LANGS.map((lang) =>
        deleteMatchingFolders(CONTENT_DIR, lang.contentDir),
      ),
    );
    log("Content directories cleanup completed.", "green");
  } catch (err) {
    log("Error cleaning up content directories: " + err.message, "red");
  }
};

const updateLanguageConfig = async () => {
  try {
    log("Updating language.json...", "cyan");
    await fs.writeFile(LANGUAGE_FILE, JSON.stringify(ENGLISH_LANG, null, 2));
    log("Updated language.json to only include English.", "green");
  } catch (err) {
    log("Error updating language.json: " + err.message, "red");
  }
};

const cleanupMenuFiles = async () => {
  try {
    log("Cleaning up menu files...", "cyan");
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
  } catch (err) {
    log("Error cleaning up menu files: " + err.message, "red");
  }
};

const cleanupI18nFiles = async () => {
  try {
    log("Cleaning up i18n files...", "cyan");
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
  } catch (err) {
    log("Error cleaning up i18n files: " + err.message, "red");
  }
};

const runCleanup = async () => {
  log("Starting cleanup process...", "blue");
  try {
    await cleanupContentDirectories();
    await updateLanguageConfig();
    await cleanupMenuFiles();
    await cleanupI18nFiles();
    log("Cleanup process completed successfully.", "green");
  } catch (err) {
    log("Error during cleanup process: " + err.message, "red");
  }
};

runCleanup();
