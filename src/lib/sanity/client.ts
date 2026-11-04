/**
 * Sanity API clients.
 *
 * - `publishedClient`: public reads of PUBLISHED content (no token). The static
 *   build reads the live API (always up to date right after a publish); dev
 *   and anonymous visitors of the preview server use the cached API CDN.
 * - `getPreviewClient()`: reads DRAFTS with the private token and encodes
 *   invisible "stega" markers into text so visual editing can link each text
 *   on the page back to its field in Studio. Only used by the preview server.
 *
 * Both are only meaningful when `isSanityConfigured` is true; in demo mode
 * `sanityFetch` never calls them.
 */
import { createClient, type SanityClient } from "@sanity/client";
import {
  apiVersion,
  dataset,
  isSanityConfigured,
  isStaticBuild,
  projectId,
  readToken,
  studioUrl,
} from "./env";

// `createClient` throws without a project ID, so demo mode uses a placeholder
const clientProjectId = isSanityConfigured ? projectId : "demo";

export const publishedClient: SanityClient = createClient({
  projectId: clientProjectId,
  dataset,
  apiVersion,
  // The API CDN can be ~1 minute behind after a publish. A build started by
  // the publish webhook must see the change, and it only sends a few dozen
  // requests, so it reads the live API.
  useCdn: !isStaticBuild,
  perspective: "published",
});

// Fields that must never contain stega markers (they are used in URLs, ids,
// classes or comparisons rather than shown as text). `data.ts` also cleans
// these values, this list just keeps the API responses tidy.
const NO_STEGA_FIELDS = new Set([
  "_id",
  "_type",
  "_key",
  "slug",
  "current",
  "url",
  "href",
  "language",
  "fieldType",
  "checkboxValue",
  "platform",
  "color",
  "titleSize",
  "appearance",
  "layout",
  "sectionDirection",
  "columnsPerRow",
  "valueType",
  "provider",
  "action",
  "mimeType",
  "date",
]);

let previewClient: SanityClient | undefined;

export const getPreviewClient = (): SanityClient => {
  previewClient ??= createClient({
    projectId: clientProjectId,
    dataset,
    apiVersion,
    useCdn: false,
    token: readToken || undefined,
    perspective: "drafts",
    stega: {
      enabled: true,
      studioUrl,
      filter: (props) => {
        // Skip SEO data and the technical fields listed above
        if (props.sourcePath.includes("seo")) return false;
        const field = props.sourcePath.at(-1);
        if (typeof field === "string" && NO_STEGA_FIELDS.has(field)) {
          return false;
        }
        return props.filterDefault(props);
      },
    },
  });
  return previewClient;
};
