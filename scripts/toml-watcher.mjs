// scripts/toml-watcher.mjs
import path from "node:path";
import * as toml from "toml";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";

// ---------- Cross-platform root ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, "..");

// ---------- Paths ----------
const configFilePath = path.resolve(
  PROJECT_ROOT,
  "src",
  "config",
  "config.toml",
);
const outputDir = path.resolve(PROJECT_ROOT, ".astro");
const outputFilePath = path.join(outputDir, "config.generated.json");

// ---------- Helpers ----------
async function pathExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

// ---------- Core conversion ----------
async function convertTomlToJson() {
  try {
    const content = await fs.readFile(configFilePath, "utf8");
    const parsed = toml.parse(content);

    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(outputFilePath, JSON.stringify(parsed, null, 2), "utf8");

    console.log(`[toml-watcher] ✓ Generated ${outputFilePath}`);
  } catch (err) {
    console.error("[toml-watcher] ✖ Conversion failed:", err?.message ?? err);
  }
}

// ---------- Debounce ----------
function debounce(fn, delay = 200) {
  let timer;
  return () => {
    clearTimeout(timer);
    timer = setTimeout(fn, delay);
  };
}

const debouncedConvert = debounce(convertTomlToJson, 150);

// ---------- Watch mode ----------
async function watchFile() {
  console.log("[toml-watcher] Watching for changes...");

  // fs.watch is inconsistent across platforms → wrap it safely
  let watcher;

  const startWatcher = async () => {
    if (!(await pathExists(configFilePath))) {
      console.warn("[toml-watcher] Waiting for config.toml to exist...");
      setTimeout(startWatcher, 1000);
      return;
    }

    watcher = fs.watch(configFilePath, () => {
      debouncedConvert();
    });

    watcher.on?.("error", (err) => {
      console.error("[toml-watcher] Watch error:", err);
      watcher?.close();
      setTimeout(startWatcher, 1000); // restart watcher
    });
  };

  await startWatcher();
}

// ---------- Run ----------
(async () => {
  // Always generate once
  await convertTomlToJson();

  // Watch mode
  if (process.argv.includes("--watch")) {
    await watchFile();
  } else {
    process.exit(0);
  }
})();
