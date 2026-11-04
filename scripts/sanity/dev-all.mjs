#!/usr/bin/env node
// scripts/sanity/dev-all.mjs
//
// `npm run dev:all` starts the website (`npm run dev`) and Sanity Studio
// (`npm run studio`) together in one terminal, on macOS, Linux and Windows.
// Each line is prefixed with [site] or [studio]. Press Ctrl+C to stop both.

import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

// ---------- Cross-platform root ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

const useColor = process.stdout.isTTY && !("NO_COLOR" in process.env);
const tasks = [
  { name: "site", script: "dev", color: 36 },
  { name: "studio", script: "studio", color: 35 },
];

const children = [];
let stopping = false;

// Print every output line with a colored [name] prefix.
function pipeWithPrefix(stream, target, prefix) {
  let buffer = "";
  stream.setEncoding("utf8");
  stream.on("data", (chunk) => {
    buffer += chunk;
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop();
    for (const line of lines) target.write(`${prefix} ${line}\n`);
  });
  stream.on("end", () => buffer && target.write(`${prefix} ${buffer}\n`));
}

// Stop a child together with everything it started (npm → astro / sanity).
function killTree(child) {
  if (child.exitCode !== null) return;
  try {
    if (process.platform === "win32") {
      spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
        stdio: "ignore",
      });
    } else {
      process.kill(-child.pid, "SIGTERM"); // the whole process group
    }
  } catch {
    child.kill("SIGTERM");
  }
}

function stopAll(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  children.forEach(killTree);
  process.exitCode = exitCode;
}

for (const task of tasks) {
  const prefix = useColor
    ? `\x1b[${task.color}m[${task.name}]\x1b[0m`
    : `[${task.name}]`;

  // `shell: true` lets Windows find npm.cmd. The command has no user input.
  const child = spawn(`npm run ${task.script}`, {
    cwd: PROJECT_ROOT,
    shell: true,
    env: { ...process.env, FORCE_COLOR: useColor ? "1" : "0" },
    stdio: ["ignore", "pipe", "pipe"],
    // Own process group on macOS/Linux, so we can stop all its sub-processes.
    detached: process.platform !== "win32",
  });

  pipeWithPrefix(child.stdout, process.stdout, prefix);
  pipeWithPrefix(child.stderr, process.stderr, prefix);

  // If one of them stops (or crashes), stop the other one too.
  child.on("exit", (code) => {
    if (!stopping) {
      console.log(`${prefix} stopped${code ? ` (exit code ${code})` : ""}`);
      stopAll(code ?? 0);
    }
  });

  children.push(child);
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));
