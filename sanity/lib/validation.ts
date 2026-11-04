/**
 * Reusable validation helpers with friendly, beginner-oriented messages.
 */
import { getDraftId, getPublishedId, type SlugValidationContext } from "sanity";
import { apiVersion } from "../env";

/**
 * Accepts the link formats the website understands:
 * - internal paths: "/contact/", "/fr/about/", "#pricing", "?ref=menu"
 *   (buttons and menu links add the language prefix and trailing slash
 *   automatically, so no trailing-slash warning is needed)
 * - full URLs: "https://example.com"
 * - email and phone links: "mailto:hello@example.com", "tel:+123456789"
 */
export function validateLinkUrl(value: unknown): true | string {
  if (value === undefined || value === null || value === "") return true;
  if (typeof value !== "string") return "The link must be text.";
  if (value.trim() !== value)
    return "Remove the spaces at the start or end of the link.";
  if (/\s/.test(value))
    return "Links can't contain spaces. Use %20 or a dash instead.";
  if (/^[/#?]/.test(value)) return true;
  if (/^(mailto|tel):.+/i.test(value)) return true;
  if (/^https?:\/\/[^/]+\.[^/]+/i.test(value)) return true;
  return 'Use a path like "/contact/", a full URL like "https://example.com", "mailto:hello@example.com" or "tel:+123456789".';
}

/** Simple email check for contact info fields. */
export function validateEmail(value: unknown): true | string {
  if (!value) return true;
  if (typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return true;
  return 'Enter a valid email address, e.g. "hello@example.com".';
}

/** Requires a slug in a URL-safe format that doesn't clash with built-in routes. */
export function validateSlugValue(
  value: { current?: string } | undefined,
  reservedSlugs: string[],
): true | string {
  const slug = value?.current;
  if (!slug) return 'Add a URL slug, or click "Generate".';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return 'Use lowercase letters, numbers and dashes only, e.g. "about-us". Click "Generate" to create one from the title.';
  }
  if (reservedSlugs.includes(slug)) {
    return `"${slug}" is reserved by the website. Please choose another slug.`;
  }
  return true;
}

/**
 * Slugs only need to be unique within one document type AND one language,
 * so "/about/" and "/fr/about/" can share the slug "about".
 */
export async function isUniqueSlugPerLanguage(
  slug: string,
  context: SlugValidationContext,
): Promise<boolean> {
  const { document, getClient } = context;
  if (!document) return true;

  const client = getClient({ apiVersion });
  const publishedId = getPublishedId(document._id);
  const params = {
    draftId: getDraftId(publishedId),
    publishedId,
    slug,
    type: document._type,
    language: (document.language as string | undefined) ?? null,
  };

  // Ignore this document (draft + published) and release versions of documents.
  const query = `!defined(*[
    _type == $type &&
    slug.current == $slug &&
    language == $language &&
    !(_id in [$draftId, $publishedId]) &&
    !(_id in path("versions.**"))
  ][0]._id)`;

  return client.fetch<boolean>(query, params);
}
