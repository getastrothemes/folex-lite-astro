import path from "node:path";
import trailingSlashChecker from "./trailingSlashChecker";
import config from "../../../.astro/config.generated.json";
import languagesJSON from "../../config/language.json";

// Load configuration from TOML file
let {
  enable: multilingualEnable,
  showDefaultLangInUrl,
  defaultLanguage,
  disableLanguages,
} = config.settings.multilingual;

export const getEnabledLocales = (): string[] => {
  let enabled = languagesJSON.map((lang) => lang.languageCode);
  const supported = languagesJSON.map((lang) => lang.languageCode);
  const disabled = multilingualEnable
    ? disableLanguages || []
    : supported.filter((lang) => lang !== defaultLanguage);

  if (disabled.length > 0) {
    enabled = supported.filter((lang) => !disabled.includes(lang as never));
  }

  return enabled;
};

export const enabledLanguages = getEnabledLocales();

/**
 * Fetches the translations for a given language. If the requested language is disabled
 * or not found, it defaults to the configured default language.
 *
 * @param {string} lang - The language code to fetch translations for.
 * @returns {Promise<Function>} A function `t(key)` that can be used to retrieve translated strings.
 */
const translationCache: Record<string, any> = {}; // Simple in-memory cache
export const useTranslations = async (lang: string): Promise<Function> => {
  const { defaultLanguage, disableLanguages } = config.settings.multilingual;

  // Fallback to default language if the requested language is disabled
  const resolvedLang = disableLanguages?.includes(lang as never)
    ? defaultLanguage
    : lang;

  // Check cache first
  if (translationCache[resolvedLang]) {
    return translationCache[resolvedLang];
  }

  // Find the language configuration
  const language =
    languagesJSON.find((l) => l.languageCode === resolvedLang) ||
    languagesJSON.find((l) => l.languageCode === defaultLanguage);

  if (!language) {
    throw new Error("Default language configuration not found");
  }

  const contentDir = language.contentDir;
  let menu, dictionary;

  try {
    menu = await import(`../../../src/config/menu.${lang}.json`);
    dictionary = await import(`../../../src/i18n/${lang}.json`);
  } catch (error) {
    // Fallback to default language if the requested language files fail to load
    menu = await import(`../../../src/config/menu.${defaultLanguage}.json`);
    dictionary = await import(`../../../src/i18n/${defaultLanguage}.json`);
  }

  // Combine translations
  const translations = {
    ...menu,
    ...dictionary,
    contentDir,
  };

  // Translation function that retrieves translated strings by key
  type NestedObject = Record<string, any>; // Generic nested object type

  // Utility type to recursively build dot-separated keys for a nested object
  type DotNotationKeys<T> = T extends NestedObject
    ? {
        [K in keyof T & string]: T[K] extends NestedObject
          ? `${K}` | `${K}.${DotNotationKeys<T[K]>}`
          : `${K}`;
      }[keyof T & string]
    : never;

  const t = <T extends NestedObject>(key: DotNotationKeys<T>): string | any => {
    // Split the key by dots to form the path
    const keys = key.split(".");

    // Traverse the object using the path
    let value: any = translations;
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return "Not Found";
      }
    }

    // Return the resolved value
    return value;
  };

  // Cache the translations
  translationCache[resolvedLang] = Object.assign(t, translations);

  return translationCache[resolvedLang];
};

/**
 * Retrieves the list of supported languages, excluding any disabled languages.
 *
 * @returns {Array} List of supported language objects.
 */
let cachedLanguages: Array<any> | null = null;
export const getSupportedLanguages = (): Array<any> => {
  if (cachedLanguages) {
    return cachedLanguages;
  }

  const supportedLanguages = [...languagesJSON.map((lang) => lang)];
  let disabledLanguages = (
    config.settings.multilingual.enable
      ? config.settings.multilingual.disableLanguages
      : supportedLanguages
          .map(
            (lang) =>
              lang.languageCode !== defaultLanguage && lang.languageCode,
          )
          .filter(Boolean)
  ) as (typeof supportedLanguages)[0]["languageCode"][];

  // Filter out the disabled languages
  cachedLanguages = disabledLanguages
    ? supportedLanguages.filter(
        (lang) => !disabledLanguages?.includes(lang.languageCode),
      )
    : supportedLanguages;

  return cachedLanguages;
};

// Export the supportedLanguages directly by calling the function
export const supportedLanguages = getSupportedLanguages();

/**
 * Generates a list of paths for each supported language, with optional language codes
 * in the URL depending on the configuration.
 *
 * @returns {Array} List of path objects containing language-specific parameters.
 */
export function generatePaths(): Array<{
  params: { lang: string | undefined };
}> {
  const supportedLanguages = getSupportedLanguages();
  const paths = supportedLanguages.map((lang) => ({
    params: {
      lang:
        lang.languageCode === defaultLanguage && !showDefaultLangInUrl
          ? undefined
          : lang.languageCode,
    },
  }));

  return paths;
}

/**
 * Generates a localized URL for a given URL and language.
 * This function ensures the language code is properly included or excluded in the URL
 * based on language settings, handles anchor IDs, and adds a trailing slash if necessary.
 *
 * @param {string} url - The original URL to be localized.
 * @param {string | undefined} providedLang - The language code for the localized URL. Defaults to the default language if not provided.
 * @param {string} [prependValue] - Optional value without any slash (ex: "services") to prepend to the URL.
 * @returns {string} The localized URL.
 */
export const getLocaleUrlCTM = (
  url: string,
  providedLang: string | undefined,
  prependValue?: string,
): string => {
  const language = providedLang || defaultLanguage;
  const languageCodes = languagesJSON.map((language) => language.languageCode);
  const languageDirectories = new Set(
    languagesJSON.map((language) => language.contentDir),
  );

  function checkIsExternal(url: string) {
    try {
      const parsedUrl = new URL(url, config.site.baseUrl);
      const baseUrl = new URL(config.site.baseUrl);

      // Only consider HTTP/HTTPS URLs
      if (!parsedUrl.protocol.startsWith("http")) {
        return false;
      }

      // Treat as internal if the origin matches the base URL
      const isSameOrigin = parsedUrl.origin === baseUrl.origin;

      // Also treat as internal if it's localhost (common in development)
      const isLocalhost =
        parsedUrl.hostname === "localhost" ||
        parsedUrl.hostname === "127.0.0.1";

      return !(isSameOrigin || isLocalhost);
    } catch (error) {
      // Malformed URLs are treated as internal by default
      return false;
    }
  }

  let updatedUrl = url;
  let isExternalUrl = checkIsExternal(url);

  // Don't handle external url
  if (isExternalUrl) return url;

  // if url contain .md or .mdx remove it
  if (url.endsWith(".mdx") || url.endsWith(".md")) {
    updatedUrl = url.replace(/\.(md|mdx)$/, "");
  }

  // If url is mailto: or dial: then don't handle it
  if (url.startsWith("mailto:") || url.startsWith("tel:")) return url;

  const isAbsoluteUrl = url.startsWith("http://") || url.startsWith("https://");
  let hash;

  // Handle absolute URLs by extracting the path (getRelativeLocaleUrl can't handle absolute URLs so we first need to convert it to a relative URL)
  if (isAbsoluteUrl) {
    // Extract the path from the absolute URL and update the URL to be relative
    updatedUrl = new URL(url).pathname;

    // Check if url contain any hash (Remove it) and add it at the end to prevent expected behavior
    if (url.includes("#")) {
      hash = url.split("#")[1];
    }
  }

  // Remove any existing language directories from the URL
  for (const langDir of languageDirectories) {
    if (updatedUrl.startsWith(`${langDir}/`)) {
      updatedUrl = updatedUrl.replace(`${langDir}/`, "/");
      break;
    }
  }

  // Prepend an optional value to the URL
  if (prependValue) {
    // Ensure updatedUrl a absolute path (services/services-01 -> /services/services-01)
    if (!prependValue.startsWith("/")) {
      updatedUrl = path.posix.join("/" + prependValue, updatedUrl);
    } else {
      updatedUrl = path.posix.join(prependValue, updatedUrl);
    }
  }

  const isDefaultLanguage = language === defaultLanguage;

  // Get the language code from the URL
  const getUrlWithoutLang = (u: string): string | undefined => {
    const segments = u.split("/");
    const lang = languageCodes.find((item) => segments.includes(item));

    const urlWithoutLang = u.replace(`/${lang}`, "");

    // if urlWithoutLang equal to empty string, return '/'
    if (urlWithoutLang === "") return "/";

    return urlWithoutLang;
  };

  const shouldShowDefaultLang = isDefaultLanguage && showDefaultLangInUrl;
  const shouldOmitDefaultLang = isDefaultLanguage && !showDefaultLangInUrl;

  // If url equal to '/', add default language code in url based on config (ex: / -> /en/)
  if (updatedUrl === "/" || updatedUrl === "") {
    updatedUrl = `/${defaultLanguage || ""}`;
  }

  /**
   * Add language code in url based on config
   * (ex: /pricing -> /en/pricing) showDefaultLangInUrl in config is true and defaultLanguage equal to provided language
   * (ex: /en/pricing -> /pricing) showDefaultLangInUrl in config is false and defaultLanguage equal to provided language
   */

  // prettier-ignore
  // Determine the language prefix for the URL, omitting the default language if necessary
  const prependLanguage = shouldOmitDefaultLang ? "" : `/${shouldShowDefaultLang ? defaultLanguage : language}`;

  // Combine the language prefix with the URL with or without its language code
  updatedUrl = path.posix.join(
    prependLanguage,
    getUrlWithoutLang(updatedUrl) as string,
  );

  // Add trailing slash if needed
  updatedUrl = trailingSlashChecker(updatedUrl);

  // Reconstruct the complete URL if the original URL is absolute, meaning it includes both a protocol and a hostname.
  if (isAbsoluteUrl) {
    updatedUrl = new URL(url).origin + updatedUrl;

    if (hash) {
      updatedUrl = `${updatedUrl}#${hash}`;
    }
  }

  return updatedUrl;
};
