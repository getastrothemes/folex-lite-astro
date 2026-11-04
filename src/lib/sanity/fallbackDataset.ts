/**
 * Demo dataset used when no Sanity project is connected.
 *
 * It loads `sanity/seed/demo-content.json` (the same content the
 * `npm run import-demo` script uploads to Sanity) and reshapes it so the
 * regular GROQ queries can run locally with groq-js:
 *
 * - Image values written for the importer as
 *   `{ _sanityAsset: "image@file://./src/assets/images/logo.svg" }`
 *   become real references `{ asset: { _ref: "image-local-..." } }`.
 * - A matching `sanity.imageAsset` document is added for every image, with a
 *   local `url` (for example `/images/logo.svg`) instead of a CDN url.
 * - Drafts are removed, just like the "published" perspective of the API.
 */

// Prefix of every synthesized asset id. `image-local-public-` marks files that
// live in `public/` (rendered as a plain <img>, not optimized by Astro).
export const LOCAL_ASSET_PREFIX = "image-local-";
export const PUBLIC_ASSET_PREFIX = "image-local-public-";

type SanityDocument = { _id: string; _type: string; [key: string]: unknown };

type LocalImageAsset = SanityDocument & {
  _type: "sanity.imageAsset";
  url: string;
  path: string;
  extension: string;
  mimeType: string;
  metadata: { dimensions: null; lqip: null };
};

const MIME_TYPES: Record<string, string> = {
  avif: "image/avif",
  gif: "image/gif",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  png: "image/png",
  svg: "image/svg+xml",
  webp: "image/webp",
};

// Lazy import: the build never fails when the seed file is missing
const seedFiles = import.meta.glob<{ documents?: SanityDocument[] }>(
  "/sanity/seed/demo-content.json",
  { import: "default" },
);

/**
 * Turns `image@file://./src/assets/images/portfolio/1.jpg` into an asset
 * document with url `/images/portfolio/1.jpg`.
 */
const createLocalAsset = (source: string): LocalImageAsset => {
  const filePath = source
    .replace(/^image@file:\/\//, "")
    .replace(/^\.\//, "")
    .replace(/^\//, "");

  // Files in `src/assets` are optimized by Astro, files in `public/` are
  // served as they are
  const isPublic = filePath.startsWith("public/");
  const url = isPublic
    ? filePath.replace(/^public/, "")
    : `/${filePath.replace(/^src\/assets\//, "")}`;

  const extension = (filePath.split(".").pop() || "").toLowerCase();
  const id = filePath
    .replace(/^(src\/assets|public)\//, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .toLowerCase();

  return {
    _id: `${isPublic ? PUBLIC_ASSET_PREFIX : LOCAL_ASSET_PREFIX}${id}`,
    _type: "sanity.imageAsset",
    url,
    path: filePath,
    extension,
    mimeType: MIME_TYPES[extension] || "application/octet-stream",
    metadata: { dimensions: null, lqip: null },
  };
};

/**
 * Walks through any value and replaces every `_sanityAsset` image with an
 * asset reference, collecting the asset documents along the way.
 */
const replaceAssets = (
  value: unknown,
  assets: Map<string, LocalImageAsset>,
): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => replaceAssets(item, assets));
  }
  if (!value || typeof value !== "object") return value;

  const { _sanityAsset, ...rest } = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(rest)) {
    result[key] = replaceAssets(child, assets);
  }

  if (typeof _sanityAsset === "string" && _sanityAsset.startsWith("image@")) {
    const asset = createLocalAsset(_sanityAsset);
    assets.set(asset._id, asset);
    result.asset = { _type: "reference", _ref: asset._id };
  }
  return result;
};

// Drafts ("drafts.x") and release versions ("versions.x.y") are not published
const isPublished = (doc: SanityDocument) => !doc._id.includes(".");

let datasetPromise: Promise<SanityDocument[]> | undefined;

/**
 * Returns the demo documents (plus synthesized image assets), loaded once per
 * process. Returns an empty list when the seed file does not exist.
 */
export const loadFallbackDataset = (): Promise<SanityDocument[]> => {
  datasetPromise ??= (async () => {
    const loadSeed = Object.values(seedFiles)[0];
    if (!loadSeed) {
      console.warn(
        "\x1b[33m[sanity] Demo content not found at sanity/seed/demo-content.json. Pages will be empty.\x1b[0m",
      );
      return [];
    }

    const seed = await loadSeed();
    const assets = new Map<string, LocalImageAsset>();
    const documents = (seed.documents || [])
      .filter(isPublished)
      .map((doc) => replaceAssets(doc, assets) as SanityDocument);

    return [...documents, ...assets.values()];
  })();
  return datasetPromise;
};
