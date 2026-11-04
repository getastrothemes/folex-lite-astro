/**
 * Small helpers that turn Sanity content into the values the theme
 * components already render (markdown strings, meta tag config, ...).
 *
 * Content itself is fetched and shaped in `src/lib/sanity/data.ts`; this file
 * only holds rendering helpers shared by several components.
 */
import { stegaClean } from "@sanity/client/stega";
import config from ".astro/config.generated.json";
import {
  getImageSrc,
  isLocalImage,
  isSvgImage,
  urlForImage,
} from "@/lib/sanity/image";
import type { SanityImageValue, Seo, SiteSettings } from "@/lib/sanity/types";
import { markdownify } from "./textConverter";

/** Removes visual-editing markers and trims (empty values become "") */
export const cleanText = (value: unknown): string =>
  value === null || value === undefined ? "" : String(stegaClean(value)).trim();

/**
 * Renders multi-line text from Studio as inline HTML: every line break
 * becomes `<br />` and markdown (bold, links, ...) is kept.
 * e.g. "We Help to Grow\nYour Business" → "We Help to Grow <br /> Your Business"
 */
export const markdownifyLines = (value: string | string[] | undefined) => {
  if (!value) return "";
  const lines = Array.isArray(value) ? value : value.split(/\r?\n/);
  return markdownify(
    lines
      .map((line) => line.trim())
      .filter(Boolean)
      .join(" <br /> "),
  );
};

/** Phone number as a markdown `tel:` link (rendered like the original theme) */
export const phoneMarkdown = (phone: string) => {
  if (!phone || phone.includes("](")) return phone;
  return `[${phone}](tel:${cleanText(phone).replace(/[^\d+]/g, "")})`;
};

/** Email address as a markdown `mailto:` link */
export const emailMarkdown = (email: string) => {
  if (!email || email.includes("](")) return email;
  return `[${email}](mailto:${cleanText(email)})`;
};

/**
 * Public URL of an image, e.g. for meta tags. Sanity images are cropped to
 * the given size by the image CDN; demo images in `src/assets` are processed
 * by Astro so they get a working url.
 */
export const imageUrl = async (
  image: SanityImageValue | null | undefined,
  size?: { width: number; height: number },
): Promise<string | undefined> => {
  if (!image?.asset?.url) return undefined;
  if (isLocalImage(image) || isSvgImage(image) || !size) {
    return (await getImageSrc(image, size?.width)) || undefined;
  }
  return urlForImage(image)
    .width(size.width)
    .height(size.height)
    .fit("crop")
    .url();
};

// SEO --------------------------------------------------------------------------

/** Meta data a page passes to `Base.astro` */
export type PageSeo = {
  /** Page title (used when `seo.metaTitle` is empty) */
  title?: string;
  /** Page description (used when `seo.metaDescription` is empty) */
  description?: string;
  /** Per-page SEO fields from Studio */
  seo?: Seo | null;
  /** Fallback share image (e.g. the page cover image) */
  image?: SanityImageValue | null;
  /** Don't append the site tagline to the title */
  disableTagline?: boolean;
  canonical?: string;
  pageType?: string;
};

/** Config object passed to the `<head>` components (Seo, OpenGraph, JSON-LD) */
export type SiteConfig = {
  site: {
    title: string;
    description: string;
    tagline: string;
    taglineSeparator: string;
    baseUrl: string;
    logo?: string;
  };
  seo: { author: string; keywords: string[]; robots: string };
  opengraph: {
    image?: string;
    twitter?: string;
    ogLocale?: string;
    ogType?: string;
    twitterCard?: string;
  };
  settings: typeof config.settings;
  head?: { content?: string };
  /** Social profile urls (JSON-LD `sameAs`) */
  socialUrls: string[];
};

/** Size used for share images (Open Graph / Twitter) */
const OG_IMAGE_SIZE = { width: 1200, height: 630 };

/**
 * Merges the technical settings from `config.toml` with the global settings
 * from Studio and the SEO fields of the current page.
 */
export const buildSiteConfig = async (
  settings: SiteSettings,
  page: PageSeo = {},
): Promise<{ config: SiteConfig; meta: ResolvedPageMeta }> => {
  const site = config.site as Record<string, any>;
  const opengraph = (config as Record<string, any>).opengraph || {};

  const siteConfig: SiteConfig = {
    site: {
      title: settings.title,
      description: settings.description,
      tagline: settings.tagline,
      taglineSeparator: site.taglineSeparator ?? "",
      baseUrl: site.baseUrl,
      logo: await imageUrl(settings.logo),
    },
    seo: {
      author: settings.seo.author,
      keywords: settings.seo.keywords,
      robots: settings.seo.robots,
    },
    opengraph: {
      ...opengraph,
      image: await imageUrl(settings.seo.ogImage, OG_IMAGE_SIZE),
      twitter: settings.seo.twitterHandle,
    },
    settings: config.settings,
    head: (config as Record<string, any>).head,
    socialUrls: settings.socialLinks.map((link) => link.url),
  };

  const seo = page.seo || {};
  const meta: ResolvedPageMeta = {
    title: cleanText(page.title) || undefined,
    metaTitle: cleanText(seo.metaTitle) || undefined,
    description: cleanText(page.description) || undefined,
    metaDescription: cleanText(seo.metaDescription) || undefined,
    image:
      (await imageUrl(seo.ogImage, OG_IMAGE_SIZE)) ||
      (await imageUrl(page.image, OG_IMAGE_SIZE)) ||
      siteConfig.opengraph.image,
    robots: seo.noIndex ? "noindex, nofollow" : siteConfig.seo.robots,
    disableTagline: page.disableTagline,
    canonical: page.canonical,
    pageType: page.pageType,
  };

  return { config: siteConfig, meta };
};

/** Page meta values, ready for the `<head>` components */
export type ResolvedPageMeta = {
  title?: string;
  metaTitle?: string;
  description?: string;
  metaDescription?: string;
  image?: string;
  robots: string;
  disableTagline?: boolean;
  canonical?: string;
  pageType?: string;
};

/**
 * True when the first visible section is a banner. The header is then shown
 * fixed and transparent on top of the dark banner (like the original home page).
 */
export const startsWithBanner = (
  sections: { _type: string; hidden?: boolean }[] | undefined,
) => {
  const first = (sections || []).find((section) => section?.hidden !== true);
  return cleanText(first?._type) === "bannerSection";
};
