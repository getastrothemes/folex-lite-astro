/**
 * One function for every content request on the site.
 *
 * - Demo mode (no project ID): runs the GROQ query locally with groq-js
 *   against the bundled demo content.
 * - Preview (valid draft-mode cookie): reads drafts with the preview client.
 * - Otherwise: reads published content from the API CDN. During a static
 *   build each query + params pair is fetched only once.
 */
import type { QueryParams } from "@sanity/client";
import { evaluate, parse, type ExprNode } from "groq-js";
import { getPreviewClient, publishedClient } from "./client";
import {
  isSanityConfigured,
  isServerOutput,
  visualEditingEnabled,
} from "./env";
import { loadFallbackDataset } from "./fallbackDataset";

export type SanityFetchOptions = {
  query: string;
  params?: QueryParams;
  /** Read drafts (only works on the preview server with a token) */
  preview?: boolean;
  /** Encode visual-editing markers in preview (default true) */
  stega?: boolean;
};

// Published results, shared by every page of a static build
const publishedCache = new Map<string, Promise<unknown>>();
// Static builds read each query once; dev and the preview server always
// fetch fresh content so edits show up on reload
const useCache = import.meta.env.PROD && !isServerOutput;

// Parsed GROQ queries for demo mode
const parsedQueries = new Map<string, ExprNode>();
let demoWarningShown = false;

const fetchFromDemoContent = async <T>(
  query: string,
  params: QueryParams,
): Promise<T> => {
  if (!demoWarningShown) {
    demoWarningShown = true;
    console.warn(
      "\x1b[33m[sanity] PUBLIC_SANITY_PROJECT_ID is not set. Showing the bundled demo content. Run `npm run setup` to connect Sanity.\x1b[0m",
    );
  }

  let tree = parsedQueries.get(query);
  if (!tree) {
    tree = parse(query);
    parsedQueries.set(query, tree);
  }

  const dataset = await loadFallbackDataset();
  const result = await evaluate(tree, { dataset, params });
  return (await result.get()) as T;
};

export async function sanityFetch<T>({
  query,
  params = {},
  preview = false,
  stega = true,
}: SanityFetchOptions): Promise<T> {
  if (!isSanityConfigured) {
    return fetchFromDemoContent<T>(query, params);
  }

  if (preview && visualEditingEnabled) {
    return getPreviewClient().fetch<T>(query, params, {
      stega,
      perspective: "drafts",
      useCdn: false,
    });
  }

  if (!useCache) {
    return publishedClient.fetch<T>(query, params);
  }

  const key = `${query}::${JSON.stringify(params)}`;
  let request = publishedCache.get(key);
  if (!request) {
    request = publishedClient.fetch<T>(query, params);
    publishedCache.set(key, request);
    // Do not keep failed requests, so a later call can retry
    request.catch(() => publishedCache.delete(key));
  }
  return request as Promise<T>;
}
