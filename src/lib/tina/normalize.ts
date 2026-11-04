import type { ContentEntry } from "./types";

// Converts Tina GraphQL results into the same shape Astro content collections
// return, so section components render identically from either source.
// The `_content_source` metadata is kept: `tinaField()` needs it to link each
// element in the preview to its field in the editor.

const DROP_KEYS = new Set(["__typename", "_values"]);
// Document-level GraphQL fields (nested `id` fields, e.g. form inputs, are content).
const DOCUMENT_KEYS = new Set(["_sys", "id"]);

// Tina Cloud returns uploaded images as https://assets.tina.io/<project>/images/...
const TINA_ASSETS = /^https:\/\/assets\.tina\.io\/[^/]+(\/images\/.+)$/;

const localImages = new Set(
  Object.keys(import.meta.glob("/src/assets/images/**/*")).map((file) =>
    file.replace(/^\/src\/assets/, ""),
  ),
);

/**
 * Maps a Tina Cloud image URL back to the theme's "/images/..." path when the
 * file is part of this build. Images uploaded after the last deploy keep their
 * Tina Cloud URL so the preview can still show them.
 */
export const toLocalImage = (value: string) => {
  const match = value.match(TINA_ASSETS);
  if (!match) return value;
  const path = decodeURI(match[1]);
  return localImages.has(path) ? path : value;
};

/** Removes nulls and GraphQL-only keys from a Tina document, recursively. */
export function cleanDocument<T = any>(node: unknown): T {
  const data = clean<Record<string, unknown>>(node);
  if (data && typeof data === "object") {
    for (const key of DOCUMENT_KEYS) delete data[key];
  }
  return data as T;
}

function clean<T = any>(value: unknown): T {
  if (Array.isArray(value)) {
    return value.filter((item) => item != null).map(clean) as T;
  }
  if (typeof value === "string") return toLocalImage(value) as T;
  if (!value || typeof value !== "object") return value as T;

  const result: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    if (item == null || DROP_KEYS.has(key)) continue;
    // Rich text and metadata are passed through untouched.
    result[key] =
      key === "_content_source" || key === "body" ? item : clean(item);
  }
  return result as T;
}

type TinaNode = {
  _sys?: { breadcrumbs?: string[]; path?: string };
  date?: string;
  body?: unknown;
  [key: string]: unknown;
};

/**
 * Turns a Tina document into a content collection-like entry.
 * `contentDir` is the language folder (e.g. "english").
 */
export function toEntry(
  node: TinaNode | null | undefined,
  collection: string,
  contentDir: string,
): ContentEntry | undefined {
  if (!node) return undefined;
  const filename = node._sys?.breadcrumbs?.at(-1) ?? "";
  const data = cleanDocument<Record<string, any>>(node);
  if (typeof data.date === "string") data.date = new Date(data.date);

  return {
    id: `${contentDir}/${filename}`,
    filePath: node._sys?.path,
    collection,
    data,
    tinaBody: node.body,
  };
}

/** Mirrors getCollectionCTM: hides drafts in production and sorts by weight. */
export const sortEntries = (entries: ContentEntry[]) =>
  (import.meta.env.PROD ? entries.filter((entry) => !entry.data.draft) : entries)
    .slice()
    .sort((a, b) => (a.data.weight ?? Infinity) - (b.data.weight ?? Infinity));
