/**
 * Sanity environment settings for the website.
 *
 * Every value comes from the root `.env` file (see `.env.example`). When
 * `PUBLIC_SANITY_PROJECT_ID` is empty the site runs in "demo mode": it reads
 * the bundled demo content (`sanity/seed/demo-content.json`) instead of the
 * Sanity API, so the theme still builds and looks like the original.
 */

import { SANITY_API_READ_TOKEN } from "astro:env/server";

// Reads a variable from the server's environment (used as a fallback for the
// public values below, which Astro also exposes as `import.meta.env.*`)
const serverEnv = (value: string | undefined, name: string) =>
  value ||
  (typeof process !== "undefined" ? process.env?.[name] : undefined) ||
  "";

// Public values (prefixed with PUBLIC_) are safe to use anywhere
export const projectId: string = (
  import.meta.env.PUBLIC_SANITY_PROJECT_ID ||
  serverEnv(undefined, "PUBLIC_SANITY_PROJECT_ID")
).trim();

export const dataset: string =
  (
    import.meta.env.PUBLIC_SANITY_DATASET ||
    serverEnv(undefined, "PUBLIC_SANITY_DATASET")
  ).trim() || "production";

// 2025-02-19 is the first API version where "published" is the default
// perspective, and it supports the "drafts" perspective used for previews
export const apiVersion: string =
  (
    import.meta.env.PUBLIC_SANITY_API_VERSION ||
    serverEnv(undefined, "PUBLIC_SANITY_API_VERSION")
  ).trim() || "2025-02-19";

// Where Sanity Studio runs (used for visual editing and "Open Studio" links)
export const studioUrl: string = (
  (
    import.meta.env.PUBLIC_SANITY_STUDIO_URL ||
    serverEnv(undefined, "PUBLIC_SANITY_STUDIO_URL")
  ).trim() || "http://localhost:3333"
).replace(/\/+$/, "");

// True when a Sanity project is connected; false means demo mode
export const isSanityConfigured: boolean = projectId.length > 0;

/**
 * Viewer token used ONLY by the preview server to read drafts.
 * Never import this into client-side scripts.
 *
 * It is declared as a secret in `astro.config.mjs` (`env.schema`), so Astro
 * reads it from the server's environment when the server runs. The value is
 * never written into the built files, and changing or revoking the token on
 * the host works without a rebuild. Never read it as `import.meta.env.*`:
 * Astro writes those values into the built server files.
 */
export const readToken: string = (SANITY_API_READ_TOKEN ?? "").trim();

/**
 * True when the site runs as the preview server (`output: "server"`).
 * `astro.config.mjs` decides this once and passes the result in, so the
 * static `npm run build` is never treated as a server, even when `.env`
 * sets `SANITY_VISUAL_EDITING=true` for local development.
 */
export const isServerOutput: boolean =
  typeof __FOLEX_SERVER_OUTPUT__ !== "undefined" &&
  __FOLEX_SERVER_OUTPUT__ === true;

/**
 * True while `astro build` renders the static site. Each query is then
 * fetched once and read from the live API instead of the API CDN, so a
 * build started by a publish webhook never gets an outdated cached answer.
 */
export const isStaticBuild: boolean = import.meta.env.PROD && !isServerOutput;

// Draft previews need the server output, a connected project and a token
export const visualEditingEnabled: boolean =
  isServerOutput && isSanityConfigured && readToken.length > 0;

// Name of the cookie that turns draft mode on for one browser
export const DRAFT_MODE_COOKIE = "folex-sanity-preview";

// How long one draft-mode cookie stays valid (12 hours). Opening the
// Presentation tool in Studio sets a fresh one.
export const DRAFT_MODE_MAX_AGE = 60 * 60 * 12;

const textEncoder = new TextEncoder();

const toHex = (buffer: ArrayBuffer) =>
  Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");

const fromHex = (hex: string): Uint8Array<ArrayBuffer> | null => {
  if (!/^(?:[0-9a-f]{2})+$/.test(hex)) return null;
  const bytes = new Uint8Array(new ArrayBuffer(hex.length / 2));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
};

// HMAC key derived from the read token (the token itself never leaves the
// server). Rotating the token makes every existing cookie invalid.
let signingKey: Promise<CryptoKey | null> | undefined;
const getSigningKey = (): Promise<CryptoKey | null> => {
  signingKey ??= readToken
    ? crypto.subtle.importKey(
        "raw",
        textEncoder.encode(`folex-draft-mode:${readToken}`),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign", "verify"],
      )
    : Promise.resolve(null);
  return signingKey;
};

/**
 * Creates the value stored in the draft-mode cookie: the time it was issued
 * plus an HMAC signature of that time. The middleware accepts it only while
 * the signature is valid and it is younger than `DRAFT_MODE_MAX_AGE`, so a
 * leaked cookie stops working on its own.
 */
export const createDraftModeCookieValue = async (): Promise<string> => {
  const key = await getSigningKey();
  if (!key) return "";
  const issuedAt = String(Math.floor(Date.now() / 1000));
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    textEncoder.encode(issuedAt),
  );
  return `${issuedAt}.${toHex(signature)}`;
};

/** Checks a draft-mode cookie created by `createDraftModeCookieValue` */
export const isValidDraftModeCookie = async (
  value: string | undefined,
): Promise<boolean> => {
  const key = await getSigningKey();
  if (!key || !value) return false;

  const [issuedAt, signatureHex, extra] = value.split(".");
  if (extra !== undefined || !/^\d{1,12}$/.test(issuedAt || "")) return false;

  // Expired (or issued in the future, allowing one minute of clock drift)
  const age = Math.floor(Date.now() / 1000) - Number(issuedAt);
  if (age > DRAFT_MODE_MAX_AGE || age < -60) return false;

  const signature = fromHex(signatureHex || "");
  if (!signature) return false;
  // `verify` compares in constant time
  return crypto.subtle.verify(
    "HMAC",
    key,
    signature,
    textEncoder.encode(issuedAt),
  );
};
