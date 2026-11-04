// scripts/tina/hosting.mjs
// Decides how the site is built for Tina CMS. Shared by astro.config.mjs and the
// Tina build/dev scripts, so the Astro adapter, the visual editing route and the
// Tina admin always agree.
//
// Live visual editing on a deployed site needs one small on-demand route
// (`/tina-island/...`), which needs an Astro adapter. Every other page stays
// static. Hosts without an adapter still get the full Tina admin (form editing).

const truthy = (value) => ["1", "true", "yes"].includes(String(value).toLowerCase());

// Hosts with a supported adapter. Cloudflare Pages is not listed: the current
// `@astrojs/cloudflare` adapter targets Workers, not Pages.
const ADAPTERS = {
  netlify: "@astrojs/netlify",
  vercel: "@astrojs/vercel",
  node: "@astrojs/node",
};

/**
 * @returns {"netlify" | "vercel" | "node" | "static"}
 */
export function detectHost(env = process.env) {
  const explicit = (env.TINA_HOSTING || "").trim().toLowerCase();
  if (explicit) {
    if (explicit !== "static" && !ADAPTERS[explicit]) {
      throw new Error(
        `[tina] Unknown TINA_HOSTING="${env.TINA_HOSTING}". Use one of: netlify, vercel, node, static.`,
      );
    }
    return explicit;
  }
  if (truthy(env.NETLIFY)) return "netlify";
  if (truthy(env.VERCEL)) return "vercel";
  return "static";
}

/** True when Tina Cloud credentials are available to this process. */
export function hasTinaCloud(env = process.env) {
  return Boolean(env.PUBLIC_TINA_CLIENT_ID && env.TINA_TOKEN);
}

/**
 * Live visual editing is available on a production build only when the host
 * can run the island route and the route can read content from Tina Cloud.
 */
export function productionVisualEditing(env = process.env) {
  return detectHost(env) !== "static" && hasTinaCloud(env);
}

/** Loads the Astro adapter for the detected host, or returns undefined. */
export async function loadAdapter(env = process.env) {
  const host = detectHost(env);
  if (host === "static") return undefined;

  let mod;
  try {
    mod = await import(/* @vite-ignore */ ADAPTERS[host]);
  } catch {
    throw new Error(
      `[tina] TINA_HOSTING="${host}" needs the ${ADAPTERS[host]} package. Install it with: npm install ${ADAPTERS[host]}`,
    );
  }

  const adapter = mod.default;
  return host === "node" ? adapter({ mode: "standalone" }) : adapter();
}
