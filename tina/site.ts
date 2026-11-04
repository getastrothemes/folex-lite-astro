import languages from "../src/config/language.json";
import siteConfig from "../.astro/config.generated.json";

// Site facts the Tina schema needs. `.astro/config.generated.json` is created
// from `src/config/config.toml` by `scripts/toml-watcher.mjs`, which the Tina
// dev and build scripts run first.

export type Language = (typeof languages)[number];

const { defaultLanguage, showDefaultLangInUrl } =
  siteConfig.settings.multilingual;

// All languages in src/config/language.json. The schema must not depend on
// settings editors can change (e.g. turning a language off), because Tina
// Cloud checks that the deployed schema matches tina/tina-lock.json.
export const LANGUAGES: Language[] = [...languages].sort(
  (a, b) => a.weight - b.weight,
);

/** Glob alternative ("{a,b}"); a single value needs no braces to match. */
export const anyOf = (values: string[]) =>
  values.length === 1 ? values[0] : `{${values.join(",")}}`;

const trailingSlash = siteConfig.site.trailingSlash;

/** Live preview is only offered when the editing route can run (see scripts/tina/hosting.mjs). */
export const VISUAL_EDITING = process.env.TINA_PUBLIC_VISUAL_EDITING === "true";

export const languageFromDir = (dir?: string) =>
  LANGUAGES.find((lang) => lang.contentDir === dir) ??
  LANGUAGES.find((lang) => lang.languageCode === defaultLanguage) ??
  LANGUAGES[0];

/** Builds a site URL for a language, matching the theme's routing settings. */
export const localeUrl = (languageCode: string, path = "") => {
  const prefix =
    languageCode === defaultLanguage && !showDefaultLangInUrl
      ? ""
      : `/${languageCode}`;
  const joined = `${prefix}/${path}`.replace(/\/+/g, "/").replace(/\/$/, "");
  const url = joined || "/";
  return trailingSlash && url !== "/" ? `${url}/` : url;
};

/** Content folder of a document (e.g. "english"), from its Tina breadcrumbs. */
export const docLanguage = (document: { _sys: { breadcrumbs: string[] } }) =>
  languageFromDir(document._sys.breadcrumbs[0]);
