/**
 * Website languages, read from the same file the Astro site uses
 * (`src/config/language.json`), so languages are never hardcoded twice.
 *
 * The language with the lowest `weight` is the default language. It has no
 * URL prefix (`/about/`), every other language does (`/fr/about/`).
 */
import languageConfig from "../../src/config/language.json";

export interface StudioLanguage {
  /** Language code stored on documents, e.g. "en". */
  id: string;
  /** Human-readable name shown in the Studio, e.g. "En". */
  title: string;
  /** True for the default (unprefixed) language. */
  isDefault: boolean;
}

const sorted = [...languageConfig].sort((a, b) => a.weight - b.weight);

/** All languages, default language first. */
export const languages: StudioLanguage[] = sorted.map((language, index) => ({
  id: language.languageCode,
  title: language.languageName,
  isDefault: index === 0,
}));

/** The default language code, e.g. "en". */
export const defaultLanguage: string = languages[0]?.id ?? "en";

/** Options list for a `language` string field. */
export const languageOptions = languages.map(({ id, title }) => ({
  title: `${title} (${id})`,
  value: id,
}));

/** Returns the language title for a code, e.g. "fr" → "Fr". */
export function languageTitle(code?: string): string {
  return (
    languages.find((language) => language.id === code)?.title ?? code ?? ""
  );
}

/** URL prefix for a language: "" for the default language, "/fr" otherwise. */
export function languagePrefix(code?: string): string {
  if (!code || code === defaultLanguage) return "";
  return `/${code}`;
}

/** Home page URL for a language, e.g. "/" or "/fr/". */
export function homePath(code?: string): string {
  return `${languagePrefix(code)}/`;
}

/** Page URL, e.g. "/about/" or "/fr/about/". */
export function pagePath(code: string | undefined, slug: string): string {
  return `${languagePrefix(code)}/${slug}/`;
}

/** Portfolio project URL, e.g. "/portfolio/my-project/". */
export function projectPath(code: string | undefined, slug: string): string {
  return `${languagePrefix(code)}/portfolio/${slug}/`;
}

/** Slugs pages can't use because the website already uses them for routes. */
export const reservedPageSlugs: string[] = [
  "portfolio",
  "api",
  "404",
  ...languages.map((language) => language.id),
];
