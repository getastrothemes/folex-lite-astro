#!/usr/bin/env node
// scripts/sanity/setup.mjs
//
// One-command Sanity setup for this theme: `npm run setup`
//
// What it does (every step is safe to run again):
//   1. Checks your Node.js version.
//   2. Makes sure you are logged in to Sanity (opens the browser if not).
//   3. Creates a new Sanity project, or uses one you already have.
//   4. Makes sure the dataset exists (public, so the static site needs no token).
//   5. Writes the project settings into `.env` (keeps the values you already have).
//   6. Allows http://localhost:4321 (website) and http://localhost:3333 (Studio)
//      to talk to your project (CORS).
//   7. Creates a read-only "Viewer" token for preview mode and saves it in `.env`
//      without ever printing it.
//   8. Optionally imports the demo content.
//
// Only Node.js built-ins are used, so it works right after `npm install`.
// Run `node scripts/sanity/setup.mjs --help` to see all options.

import path from "node:path";
import { promises as fs } from "node:fs";
import { existsSync } from "node:fs";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import readline from "node:readline/promises";

// ---------- Cross-platform root ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

// ---------- Paths ----------
const ENV_FILE = path.join(PROJECT_ROOT, ".env");
const ENV_EXAMPLE_FILE = path.join(PROJECT_ROOT, ".env.example");
const IMPORT_SCRIPT = path.join(__dirname, "import-demo.mjs");

// ---------- Defaults ----------
const DEFAULT_PROJECT_NAME = "Folex website";
const DEFAULT_DATASET = "production";
const SITE_ORIGIN = "http://localhost:4321";
const STUDIO_ORIGIN = "http://localhost:3333";
const TOKEN_LABEL = "Folex preview (read-only)";
const MIN_NODE = [22, 12]; // the Sanity CLI needs Node.js 22.12 or newer

// Values written to `.env` when the key has no value yet.
const ENV_DEFAULTS = {
  PUBLIC_SANITY_DATASET: DEFAULT_DATASET,
  PUBLIC_SANITY_API_VERSION: "2025-02-19",
  PUBLIC_SANITY_STUDIO_URL: STUDIO_ORIGIN,
  SANITY_STUDIO_DATASET: DEFAULT_DATASET,
  SANITY_STUDIO_PREVIEW_URL: SITE_ORIGIN,
};

// Keys whose values must never be printed.
const isSecretKey = (key) => /TOKEN|SECRET|PASSWORD/i.test(key);

// ---------------- Colors / logging ----------------
const useColor = process.stdout.isTTY && !("NO_COLOR" in process.env);
const paint = (code) => (text) =>
  useColor ? `\x1b[${code}m${text}\x1b[0m` : String(text);
const c = {
  bold: paint(1),
  dim: paint(2),
  red: paint(31),
  green: paint(32),
  yellow: paint(33),
  cyan: paint(36),
};

const log = (message = "") => console.log(message);
const step = (title) => log(`\n${c.bold(c.cyan(`> ${title}`))}`);
const ok = (message) => log(`  ${c.green("✓")} ${message}`);
const info = (message) => log(`  ${c.dim("·")} ${message}`);
const warn = (message) => log(`  ${c.yellow("!")} ${message}`);
const fail = (message) => console.error(`\n${c.red("✖")} ${message}\n`);

// ---------------- Command-line options ----------------
const HELP = `
${c.bold("Sanity setup for this theme")}

Usage:
  npm run setup                     Interactive guided setup (recommended)
  npm run setup -- [options]        Pass options after "--" when using npm
  node scripts/sanity/setup.mjs [options]

Options:
  --project <id>         Use this existing Sanity project ID
  --name <name>          Name for a NEW project (default: "${DEFAULT_PROJECT_NAME}")
  --organization <id>    Organization ID or slug for a new project
                         (only needed when your account has several)
  --dataset <name>       Dataset name (default: "${DEFAULT_DATASET}")
  --cors-origin <url>    Also allow this origin, e.g. your preview server URL
                         (can be repeated)
  --yes, -y              Do not ask questions, use the defaults
  --skip-import          Do not import the demo content
  --skip-token           Do not create the preview (Viewer) token
  --skip-cors            Do not add CORS origins
  --dry-run              Only show what would happen. Nothing is changed,
                         no Sanity command is run, no login is needed.
  --help, -h             Show this help

Examples:
  npm run setup
  npm run setup -- --project abc123de --yes
  npm run setup -- --yes --skip-import
  npm run setup -- --dry-run
`;

function parseArgs(argv) {
  const options = {
    project: "",
    name: "",
    organization: "",
    dataset: "",
    corsOrigins: [],
    yes: false,
    skipImport: false,
    skipToken: false,
    skipCors: false,
    dryRun: false,
    help: false,
  };

  // Options that need a value after them, e.g. `--project abc123`
  const withValue = {
    "--project": "project",
    "--name": "name",
    "--organization": "organization",
    "--dataset": "dataset",
    "--cors-origin": "corsOrigins",
  };

  for (let i = 0; i < argv.length; i++) {
    // Support both `--project abc` and `--project=abc`
    const [flag, inlineValue] = argv[i].split(/=(.*)/s, 2);

    if (flag in withValue) {
      const value = inlineValue ?? argv[++i];
      if (!value || value.startsWith("--")) {
        throw new Error(`${flag} needs a value, e.g. ${flag} my-value`);
      }
      const key = withValue[flag];
      if (Array.isArray(options[key])) options[key].push(value);
      else options[key] = value;
      continue;
    }

    switch (flag) {
      case "--yes":
      case "-y":
        options.yes = true;
        break;
      case "--skip-import":
        options.skipImport = true;
        break;
      case "--skip-token":
        options.skipToken = true;
        break;
      case "--skip-cors":
        options.skipCors = true;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--help":
      case "-h":
        options.help = true;
        break;
      default:
        throw new Error(`Unknown option "${argv[i]}". Run with --help.`);
    }
  }

  return options;
}

// ---------------- Questions ----------------
let rl = null;
let interactive = true;

async function ask(question, defaultValue = "") {
  if (!interactive) return defaultValue;
  rl ??= readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const hint = defaultValue ? c.dim(` (${defaultValue})`) : "";
  const answer = (await rl.question(`  ${question}${hint}: `)).trim();
  return answer || defaultValue;
}

async function confirm(question, defaultYes = true) {
  if (!interactive) return defaultYes;
  const answer = await ask(`${question} ${defaultYes ? "[Y/n]" : "[y/N]"}`);
  if (!answer) return defaultYes;
  return /^y(es)?$/i.test(answer);
}

// Close the prompt before handing the terminal to another program.
function pauseQuestions() {
  rl?.close();
  rl = null;
}

// ---------------- Running the Sanity CLI ----------------
// We start the CLI with the current Node.js binary instead of `npx`. That works
// the same on macOS, Linux and Windows and is faster.
function resolveSanityBin() {
  try {
    const require = createRequire(import.meta.url);
    const pkgPath = require.resolve("@sanity/cli/package.json");
    const pkg = require(pkgPath);
    const bin = typeof pkg.bin === "string" ? pkg.bin : pkg.bin?.sanity;
    if (bin) return path.resolve(path.dirname(pkgPath), bin);
  } catch {
    // handled below
  }
  return null;
}

const SANITY_BIN = resolveSanityBin();

// Extra environment for every CLI call, so `sanity.cli.ts` can read the
// project ID even before `.env` exists.
let cliEnv = {};

/**
 * Run `sanity <args>`.
 * - capture: false → the user sees the output and can answer prompts.
 * - capture: true  → output is collected and returned (nothing is printed).
 */
function runSanity(args, { capture = false } = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [SANITY_BIN, ...args], {
      cwd: PROJECT_ROOT,
      env: { ...process.env, ...cliEnv },
      stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
    });

    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => (stdout += chunk));
    child.stderr?.on("data", (chunk) => (stderr += chunk));
    child.on("error", (error) =>
      resolve({ code: 1, stdout, stderr: String(error) }),
    );
    child.on("close", (code) => resolve({ code: code ?? 1, stdout, stderr }));
  });
}

// Pull a JSON object out of CLI output (ignores any notice printed around it).
function parseJsonOutput(text) {
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}

// Last meaningful line of an error, without the CLI's colors.
function cleanError(text) {
  const lines = String(text)
    .replace(/\x1b\[[0-9;]*m/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !/telemetry|^[│╭╰─]/i.test(line));
  return lines.slice(-3).join(" ") || "unknown error";
}

const showCommand = (args) =>
  `sanity ${args.map((a) => (/\s/.test(a) ? `"${a}"` : a)).join(" ")}`;

// ---------------- .env helpers ----------------
const ENV_LINE = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/;

// Read a value as written in .env: removes quotes and trailing comments.
function unquote(raw) {
  const value = raw.trim();
  const quoted = value.match(/^(['"])(.*)\1$/);
  if (quoted) return quoted[2];
  return value.replace(/\s+#.*$/, "");
}

function parseEnv(text) {
  const values = {};
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(ENV_LINE);
    if (match) values[match[1]] = unquote(match[2]);
  }
  return values;
}

function formatValue(value) {
  const text = String(value);
  return /[\s#"']/.test(text) ? JSON.stringify(text) : text;
}

async function readTextFile(file) {
  try {
    return await fs.readFile(file, "utf8");
  } catch {
    return null;
  }
}

/**
 * Build the new .env text.
 * - Starts from the existing .env (or .env.example when there is no .env yet),
 *   so comments and order are kept.
 * - `updates` always win (the project/dataset/token chosen in this run).
 * - `defaults` only fill keys that are still empty.
 * - Keys from .env.example that are missing in .env are added at the end.
 */
function mergeEnv({ existingText, exampleText, updates, defaults }) {
  const base = existingText ?? exampleText ?? "";
  const lines = base.split(/\r?\n/);
  const seen = new Set();

  const merged = lines.map((line) => {
    const match = line.match(ENV_LINE);
    if (!match) return line;
    const key = match[1];
    seen.add(key);

    if (key in updates) return `${key}=${formatValue(updates[key])}`;
    if (key in defaults && unquote(match[2]) === "") {
      return `${key}=${formatValue(defaults[key])}`;
    }
    return line;
  });

  // Anything still missing goes at the bottom.
  const exampleValues =
    existingText && exampleText ? parseEnv(exampleText) : {};
  const missing = new Map();
  for (const [key, value] of Object.entries(exampleValues)) {
    if (!seen.has(key)) missing.set(key, value);
  }
  for (const [key, value] of Object.entries({ ...defaults, ...updates })) {
    if (!seen.has(key)) missing.set(key, value);
  }

  if (missing.size > 0) {
    while (merged.length && merged[merged.length - 1].trim() === "")
      merged.pop();
    merged.push("", "# Added by `npm run setup`");
    for (const [key, value] of missing)
      merged.push(`${key}=${formatValue(value)}`);
  }

  return `${merged.join("\n").replace(/\n+$/, "")}\n`;
}

// ---------------- Steps ----------------
function checkNodeVersion() {
  step("Checking Node.js");
  const [major, minor] = process.versions.node.split(".").map(Number);
  const [needMajor, needMinor] = MIN_NODE;
  if (major < needMajor || (major === needMajor && minor < needMinor)) {
    fail(
      `Node.js ${needMajor}.${needMinor} or newer is required (you have ${process.version}).\n` +
        "  Download the LTS version from https://nodejs.org and run this again.",
    );
    process.exit(1);
  }
  ok(`Node.js ${process.version}`);

  if (!SANITY_BIN) {
    fail(
      "The Sanity CLI was not found. Run `npm install` first, then run this again.",
    );
    process.exit(1);
  }
}

async function ensureLoggedIn(options) {
  step("Checking your Sanity login");

  if (options.dryRun) {
    info(`Would run: ${showCommand(["whoami", "--json"])}`);
    info(
      `If you are not logged in: ${showCommand(["login"])} (opens your browser)`,
    );
    return;
  }

  const whoami = async () => {
    const result = await runSanity(["whoami", "--json"], { capture: true });
    return result.code === 0 ? parseJsonOutput(result.stdout) : null;
  };

  let user = await whoami();
  if (!user) {
    info("You are not logged in yet. Your browser will open so you can log in");
    info("or create a free Sanity account.");
    pauseQuestions();
    await runSanity(["login"]);
    user = await whoami();
  }

  if (!user) {
    fail(
      "Could not log in to Sanity. Run `npx sanity login`, then run this again.",
    );
    process.exit(1);
  }
  ok(`Logged in as ${user.name || user.email || user.id}`);
}

async function createProject(options) {
  const name =
    options.name || (await ask("Project name", DEFAULT_PROJECT_NAME));
  const args = [
    "projects",
    "create",
    name,
    "--dataset",
    options.dataset,
    "--dataset-visibility",
    "public",
    "--json",
    "--yes",
  ];
  if (options.organization) args.push("--organization", options.organization);

  if (options.dryRun) {
    info(`Would run: ${showCommand(args)}`);
    return "<new-project-id>";
  }

  info(`Creating project "${name}"...`);
  let result = await runSanity(args, { capture: true });
  let project = result.code === 0 ? parseJsonOutput(result.stdout) : null;

  // Accounts with several organizations must pick one.
  if (
    !project &&
    /Multiple organizations/i.test(result.stderr + result.stdout)
  ) {
    warn("Your account belongs to several organizations. Pick one:");
    pauseQuestions();
    await runSanity(["organizations", "list"]);
    const organization = interactive
      ? await ask("Organization ID or slug")
      : "";
    if (!organization) {
      fail(
        "Run again with --organization <id>, e.g. npm run setup -- --organization my-team",
      );
      process.exit(1);
    }
    result = await runSanity([...args, "--organization", organization], {
      capture: true,
    });
    project = result.code === 0 ? parseJsonOutput(result.stdout) : null;
  }

  // Brand-new accounts have no organization yet: let the Sanity CLI ask the
  // user to create one, then ask for the project ID it printed.
  if (
    !project &&
    /No organizations/i.test(result.stderr + result.stdout) &&
    interactive
  ) {
    warn(
      "Your account has no organization yet. The Sanity CLI will help you create one.",
    );
    pauseQuestions();
    await runSanity([
      "projects",
      "create",
      name,
      "--dataset",
      options.dataset,
      "--dataset-visibility",
      "public",
    ]);
    const id = await ask("Paste the project ID shown above (ID: ...)");
    if (id) return id;
  }

  if (!project?.projectId) {
    fail(
      `Could not create the project: ${cleanError(result.stderr || result.stdout)}`,
    );
    process.exit(1);
  }

  ok(`Created project "${project.displayName || name}" (${project.projectId})`);
  return project.projectId;
}

async function chooseProject(options, currentEnv) {
  step("Choosing your Sanity project");

  if (options.project) {
    ok(`Using project ${options.project} (from --project)`);
    return { projectId: options.project, isNew: false };
  }

  // Re-running setup? Offer the project that is already in .env.
  const fromEnv =
    currentEnv.PUBLIC_SANITY_PROJECT_ID || currentEnv.SANITY_STUDIO_PROJECT_ID;
  if (
    fromEnv &&
    (await confirm(`Keep using project ${fromEnv} from your .env?`, true))
  ) {
    ok(`Using project ${fromEnv} (from .env)`);
    return { projectId: fromEnv, isNew: false };
  }

  if (interactive) {
    log("");
    log("    1) Create a new Sanity project (recommended for a new website)");
    log("    2) Use a project I already have");
    const choice = await ask("Choose 1 or 2", "1");

    if (choice.trim() === "2") {
      if (options.dryRun) {
        info(`Would run: ${showCommand(["projects", "list"])}`);
      } else {
        pauseQuestions();
        await runSanity(["projects", "list"]);
      }
      const id = await ask("Project ID (first column above)");
      if (!id) {
        fail("No project ID given. Run setup again when you have it.");
        process.exit(1);
      }
      return { projectId: id, isNew: false };
    }
  }

  return { projectId: await createProject(options), isNew: true };
}

// Always checked, also for new projects: `projects create` only warns (and
// still succeeds) when creating the dataset fails.
async function ensureDataset(options, projectId) {
  step(`Checking the "${options.dataset}" dataset`);

  const listArgs = ["datasets", "list", "--project", projectId];
  const createArgs = [
    "datasets",
    "create",
    options.dataset,
    "--visibility",
    "public",
    "--project",
    projectId,
  ];

  if (options.dryRun) {
    info(`Would run: ${showCommand(listArgs)}`);
    info(`If it is missing: ${showCommand(createArgs)}`);
    return;
  }

  const list = await runSanity(listArgs, { capture: true });
  if (list.code !== 0) {
    fail(
      `Could not open project "${projectId}": ${cleanError(list.stderr || list.stdout)}\n` +
        "  Check the project ID at https://www.sanity.io/manage",
    );
    process.exit(1);
  }

  const names = list.stdout.split(/\r?\n/).map((line) => line.trim());
  if (names.includes(options.dataset)) {
    ok(`Dataset "${options.dataset}" exists`);
    return;
  }

  info(`Creating public dataset "${options.dataset}"...`);
  const created = await runSanity(createArgs, { capture: true });
  if (created.code !== 0) {
    fail(
      `Could not create the dataset: ${cleanError(created.stderr || created.stdout)}`,
    );
    process.exit(1);
  }
  ok(`Created public dataset "${options.dataset}"`);
}

async function writeEnvFile(options, updates, previewMode) {
  const existingText = await readTextFile(ENV_FILE);
  const exampleText = await readTextFile(ENV_EXAMPLE_FILE);

  // Preview mode: only decided here when .env does not have a value yet.
  const defaults = { ...ENV_DEFAULTS };
  const current = existingText ? parseEnv(existingText) : {};
  const nextUpdates = { ...updates };
  if (!current.SANITY_VISUAL_EDITING && previewMode !== undefined) {
    nextUpdates.SANITY_VISUAL_EDITING = previewMode ? "true" : "false";
  }

  const text = mergeEnv({
    existingText,
    exampleText,
    updates: nextUpdates,
    defaults,
  });
  const after = parseEnv(text);

  // Show what changed, hiding secrets.
  const changed = Object.keys(after).filter(
    (key) => after[key] !== current[key],
  );
  for (const key of changed) {
    const shown = !after[key]
      ? c.dim("(empty)")
      : isSecretKey(key)
        ? c.dim("(hidden)")
        : after[key];
    info(`${key}=${shown}`);
  }

  if (options.dryRun) {
    info(
      `Would ${existingText === null ? "create" : "update"} .env (${changed.length} value(s))`,
    );
    return after;
  }

  if (changed.length === 0 && existingText !== null) {
    ok(".env is already up to date");
    return after;
  }

  await fs.writeFile(ENV_FILE, text, { encoding: "utf8", mode: 0o600 });
  ok(`${existingText === null ? "Created" : "Updated"} .env`);
  return after;
}

async function addCorsOrigins(options, projectId) {
  step("Allowing your local website and Studio (CORS)");

  const origins = [
    ...new Set([SITE_ORIGIN, STUDIO_ORIGIN, ...options.corsOrigins]),
  ];
  const listArgs = ["cors", "list", "--project", projectId];

  if (options.dryRun) {
    info(`Would run: ${showCommand(listArgs)}`);
    for (const origin of origins) {
      info(
        `Would run (if missing): ${showCommand(["cors", "add", origin, "--credentials", "--project", projectId])}`,
      );
    }
    return;
  }

  const list = await runSanity(listArgs, { capture: true });
  const existing = new Set(
    list.code === 0
      ? list.stdout.split(/\r?\n/).map((line) => line.trim())
      : [],
  );

  for (const origin of origins) {
    if (existing.has(origin)) {
      ok(`${origin} is already allowed`);
      continue;
    }
    const result = await runSanity(
      ["cors", "add", origin, "--credentials", "--project", projectId],
      { capture: true },
    );
    const output = result.stderr + result.stdout;
    if (result.code === 0) ok(`Allowed ${origin}`);
    else if (/already|exist|conflict|409/i.test(output))
      ok(`${origin} is already allowed`);
    else warn(`Could not add ${origin}: ${cleanError(output)}`);
  }
}

async function createViewerToken(options, projectId) {
  step("Creating a read-only token for preview mode");

  const args = [
    "tokens",
    "create",
    TOKEN_LABEL,
    "--project",
    projectId,
    "--role",
    "viewer",
    "--json",
    "--yes",
  ];

  if (options.dryRun) {
    info(`Would run: ${showCommand(args)}`);
    info(
      "The token would be saved to SANITY_API_READ_TOKEN in .env (never printed).",
    );
    return "";
  }

  // The output contains the secret token, so it is captured and never printed.
  const result = await runSanity(args, { capture: true });
  const token = result.code === 0 ? parseJsonOutput(result.stdout)?.token : "";

  if (!token) {
    warn(`Could not create the token: ${cleanError(result.stderr)}`);
    warn(
      "Create a Viewer token at https://www.sanity.io/manage > API > Tokens",
    );
    warn("and paste it into SANITY_API_READ_TOKEN in your .env file.");
    return "";
  }

  ok(`Created token "${TOKEN_LABEL}" (saved to .env, not shown)`);
  return token;
}

async function importDemoContent(options, projectId, isNew) {
  step("Demo content");

  if (options.skipImport) {
    info("Skipped (--skip-import). Import later with: npm run import-demo");
    return;
  }

  if (!existsSync(IMPORT_SCRIPT)) {
    warn(
      "The demo import script (scripts/sanity/import-demo.mjs) was not found. Skipped.",
    );
    return;
  }

  // Only new projects default to "yes" (also with --yes, so re-runs are safe).
  // Existing projects use `--missing`: documents you already have are kept.
  const wanted = await confirm(
    isNew
      ? "Import the demo content so the site looks like the theme demo?"
      : "Add the demo content to this existing project? (existing documents are kept)",
    isNew,
  );
  const importArgs = isNew ? [] : ["--missing"];
  if (!wanted) {
    info("Skipped. Import later with: npm run import-demo");
    return;
  }

  if (options.dryRun) {
    info(
      `Would run: node scripts/sanity/import-demo.mjs${importArgs.length ? ` ${importArgs.join(" ")}` : ""} (project ${projectId}, dataset ${options.dataset})`,
    );
    return;
  }

  pauseQuestions();
  const code = await new Promise((resolve) => {
    const child = spawn(process.execPath, [IMPORT_SCRIPT, ...importArgs], {
      cwd: PROJECT_ROOT,
      stdio: "inherit",
      env: { ...process.env, ...cliEnv },
    });
    child.on("error", () => resolve(1));
    child.on("close", (exitCode) => resolve(exitCode ?? 1));
  });

  if (code === 0) ok("Demo content imported");
  else
    warn(
      "The import did not finish. Try again later with: npm run import-demo",
    );
}

function printNextSteps(env, options) {
  const previewOn = env.SANITY_VISUAL_EDITING === "true";

  log(
    `\n${c.bold(c.green(options.dryRun ? "Dry run finished. Nothing was changed." : "All set!"))}\n`,
  );
  log(c.bold("Next steps:"));
  log(
    `  1. ${c.cyan("npm run dev:all")}   starts the website and the Studio together`,
  );
  log(`     Website: ${SITE_ORIGIN}`);
  log(`     Studio:  ${STUDIO_ORIGIN}   (log in with the same Sanity account)`);
  log(
    `  2. In the Studio, open ${c.bold("Presentation")} to edit pages with a live preview.`,
  );
  log(
    `  3. When you are happy, publish the Studio online: ${c.cyan("npm run studio:deploy")}`,
  );
  log(
    "     then set PUBLIC_SANITY_STUDIO_URL in .env to the Studio address it prints.",
  );
  log(
    `  4. Deploy the website (Netlify, Vercel, Cloudflare Pages...) with these`,
  );
  log("     environment variables on the host:");
  log(
    `       PUBLIC_SANITY_PROJECT_ID=${env.PUBLIC_SANITY_PROJECT_ID || "<your-project-id>"}`,
  );
  log(
    `       PUBLIC_SANITY_DATASET=${env.PUBLIC_SANITY_DATASET || DEFAULT_DATASET}`,
  );
  log("       PUBLIC_SANITY_STUDIO_URL=<your studio url>");
  log("     Do NOT set SANITY_API_READ_TOKEN or SANITY_VISUAL_EDITING there.");

  if (previewOn) {
    log("");
    log(
      c.yellow(
        "Note: SANITY_VISUAL_EDITING=true in your .env runs the website as a",
      ),
    );
    log(
      c.yellow(
        "small Node server (needed for drafts and click-to-edit). To build the",
      ),
    );
    log(
      c.yellow(
        "normal static site locally, set it to false before `npm run build`.",
      ),
    );
  }
  log("");
}

// ---------------- Main ----------------
async function main() {
  let options;
  try {
    options = parseArgs(process.argv.slice(2));
  } catch (error) {
    fail(error.message);
    process.exit(1);
  }

  if (options.help) {
    log(HELP);
    return;
  }

  // Without a terminal (CI, pipes) there is nobody to answer questions.
  interactive = !options.yes && Boolean(process.stdin.isTTY);

  log(c.bold("\nSanity setup for this theme"));
  if (options.dryRun) log(c.yellow("Dry run: nothing will be changed."));
  if (!interactive && !options.yes) {
    info("No terminal detected, using the defaults (same as --yes).");
  }

  checkNodeVersion();

  const existingText = await readTextFile(ENV_FILE);
  const currentEnv = existingText ? parseEnv(existingText) : {};
  options.dataset ||= currentEnv.PUBLIC_SANITY_DATASET || DEFAULT_DATASET;
  if (!options.project && !interactive && !options.yes) options.yes = true;

  await ensureLoggedIn(options);

  const { projectId, isNew } = await chooseProject(options, currentEnv);
  if (!/^[a-z0-9-]+$/.test(projectId) && !options.dryRun) {
    fail(
      `"${projectId}" does not look like a Sanity project ID (lowercase letters and numbers).`,
    );
    process.exit(1);
  }
  if (interactive && !options.dryRun && !isNew) {
    options.dataset = await ask("Dataset name", options.dataset);
  }

  // Let `sanity.cli.ts` find the project even before .env is written.
  cliEnv = {
    SANITY_STUDIO_PROJECT_ID: projectId,
    SANITY_STUDIO_DATASET: options.dataset,
    PUBLIC_SANITY_PROJECT_ID: projectId,
    PUBLIC_SANITY_DATASET: options.dataset,
  };

  // A token only works for the project it was created in.
  const projectChanged =
    Boolean(currentEnv.PUBLIC_SANITY_PROJECT_ID) &&
    currentEnv.PUBLIC_SANITY_PROJECT_ID !== projectId;
  const hasToken = Boolean(currentEnv.SANITY_API_READ_TOKEN) && !projectChanged;

  // Click-to-edit preview needs the token, so it is only switched on with one.
  let previewMode;
  if (!currentEnv.SANITY_VISUAL_EDITING) {
    previewMode =
      options.skipToken && !hasToken
        ? false
        : await confirm(
            "Turn on preview mode (drafts + click-to-edit) for local development?",
            true,
          );
  }

  step("Saving settings to .env");
  const updates = {
    PUBLIC_SANITY_PROJECT_ID: projectId,
    PUBLIC_SANITY_DATASET: options.dataset,
    SANITY_STUDIO_PROJECT_ID: projectId,
    SANITY_STUDIO_DATASET: options.dataset,
  };
  if (projectChanged && currentEnv.SANITY_API_READ_TOKEN) {
    updates.SANITY_API_READ_TOKEN = ""; // old token belongs to another project
  }
  // Saved right away, so a re-run reuses this project instead of creating
  // another one if a later step fails.
  let env = await writeEnvFile(options, updates, previewMode);

  await ensureDataset(options, projectId);

  if (options.skipCors) {
    step("CORS");
    info("Skipped (--skip-cors)");
  } else {
    await addCorsOrigins(options, projectId);
  }

  if (options.skipToken) {
    step("Preview token");
    info("Skipped (--skip-token)");
  } else if (hasToken) {
    step("Preview token");
    ok("SANITY_API_READ_TOKEN is already set in .env (kept)");
  } else {
    const token = await createViewerToken(options, projectId);
    if (token) {
      env = await writeEnvFile(options, { SANITY_API_READ_TOKEN: token });
    }
  }

  await importDemoContent(options, projectId, isNew);

  printNextSteps(env, options);
}

main()
  .catch((error) => {
    fail(error?.message ?? String(error));
    process.exitCode = 1;
  })
  .finally(() => pauseQuestions());
