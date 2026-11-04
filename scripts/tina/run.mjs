// scripts/tina/run.mjs
// Runs the site together with Tina CMS.
//
//   node scripts/tina/run.mjs dev    -> local editing at http://localhost:4321/admin/
//   node scripts/tina/run.mjs build  -> production build (Tina admin + static site)
//   node scripts/tina/run.mjs check  -> type check (`astro check`)
//
// Extra arguments are passed to `astro dev` / `astro build`.

import { spawn, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  detectHost,
  hasTinaCloud,
  productionVisualEditing,
} from "./hosting.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const [command, ...extraArgs] = process.argv.slice(2);

// Local credentials, if any (hosting providers set real environment variables).
if (existsSync(path.join(ROOT, ".env"))) process.loadEnvFile(path.join(ROOT, ".env"));

const quote = (arg) => (/[\s"]/.test(arg) ? `"${arg.replace(/"/g, '\\"')}"` : arg);
const astroArgs = extraArgs.map(quote).join(" ");

function run(cmd, env = {}) {
  const result = spawnSync(cmd, {
    cwd: ROOT,
    shell: true,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

// config.toml -> .astro/config.generated.json (read by Astro and Tina)
const generateConfig = () => run("node scripts/toml-watcher.mjs");

function notice(lines) {
  const width = Math.max(...lines.map((line) => line.length));
  const border = "─".repeat(width + 2);
  console.log(`\n┌${border}┐`);
  for (const line of lines) console.log(`│ ${line.padEnd(width)} │`);
  console.log(`└${border}┘\n`);
}

// Shown at /admin/ on a deployed site that is not connected to Tina Cloud yet.
const NOT_CONNECTED_PAGE = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>CMS not connected yet</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 4rem auto; padding: 0 1rem; line-height: 1.6; color: #1a1a1a; }
      code { background: #f3f3f3; padding: 0.1rem 0.35rem; border-radius: 0.25rem; }
    </style>
  </head>
  <body>
    <h1>The CMS is not connected yet</h1>
    <p>This website was built without Tina Cloud credentials, so online editing is turned off. The website itself works normally.</p>
    <p>To edit this site online, add these environment variables in your hosting provider and redeploy:</p>
    <ul>
      <li><code>PUBLIC_TINA_CLIENT_ID</code>: the Client ID of your Tina Cloud project</li>
      <li><code>TINA_TOKEN</code>: a read-only token from the same project</li>
    </ul>
    <p>The README of this theme ("Publish your changes online") explains every step.</p>
  </body>
</html>
`;

if (command === "dev") {
  generateConfig();

  // Regenerate the config when Site settings are saved.
  const watcher = spawn("node", ["scripts/toml-watcher.mjs", "--watch"], {
    cwd: ROOT,
    stdio: ["ignore", "ignore", "inherit"],
  });

  const dev = spawn(
    `npx tinacms dev -c ${quote(`astro dev ${astroArgs}`.trim())}`,
    {
      cwd: ROOT,
      shell: true,
      stdio: "inherit",
      env: { ...process.env, TINA_PUBLIC_VISUAL_EDITING: "true" },
    },
  );

  const stop = () => {
    watcher.kill();
    dev.kill();
  };
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  dev.on("exit", (code) => {
    watcher.kill();
    process.exit(code ?? 0);
  });
} else if (command === "build") {
  generateConfig();

  const visualEditing = productionVisualEditing();
  const tinaEnv = { TINA_PUBLIC_VISUAL_EDITING: String(visualEditing) };

  // The editor bridge script must be in public/ before `astro build`: some
  // adapters (e.g. Vercel) copy the static output before @tinacms/astro adds it.
  const bridgeFile = path.join(ROOT, "public/admin/bridge.js");
  rmSync(bridgeFile, { force: true });

  if (hasTinaCloud()) {
    // Builds the admin for Tina Cloud and checks the schema against it.
    run("npx tinacms build --content=local", tinaEnv);
    if (visualEditing) {
      // Resolved from @tinacms/astro, which depends on it (works with npm and pnpm).
      const fromTinaAstro = createRequire(
        path.join(ROOT, "node_modules/@tinacms/astro/package.json"),
      );
      copyFileSync(fromTinaAstro.resolve("@tinacms/bridge"), bridgeFile);
    }
    if (!visualEditing) {
      notice([
        "Tina Cloud is connected. Live visual editing is off on this host",
        `(${detectHost()}): editors use the Tina form editor instead.`,
        "See the README section on live visual editing.",
      ]);
    }
  } else {
    notice([
      "Tina Cloud is not configured (PUBLIC_TINA_CLIENT_ID / TINA_TOKEN).",
      "The website builds normally, but online editing at /admin/ is off.",
      "Local editing with `npm run dev` still works.",
    ]);
    // Generates the Tina client and types without contacting Tina Cloud.
    run("npx tinacms build --local --skip-cloud-checks --skip-search-index", tinaEnv);
    mkdirSync(path.join(ROOT, "public/admin"), { recursive: true });
    writeFileSync(path.join(ROOT, "public/admin/index.html"), NOT_CONNECTED_PAGE);
  }

  run(`npx astro build ${astroArgs}`.trim());
  run("node scripts/remove-draft-from-sitemap.mjs");
} else if (command === "check") {
  generateConfig();
  // The Tina client and types are generated, not committed.
  if (!existsSync(path.join(ROOT, "tina/__generated__/client.ts"))) {
    run("npx tinacms build --local --skip-cloud-checks --skip-search-index");
  }
  run(`npx astro check ${astroArgs}`.trim());
} else {
  console.error("Usage: node scripts/tina/run.mjs <dev|build|check> [astro arguments]");
  process.exit(1);
}
