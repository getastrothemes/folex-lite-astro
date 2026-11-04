/**
 * Singleton and per-language document settings shared by the Studio config
 * and the desk structure.
 */
import { languages } from "./languages";

/** Global singleton: one document for the whole site, fixed `_id`. */
export const SITE_SETTINGS_ID = "siteSettings";

/** Per-language singletons: one document per language, `_id` = `${type}-${languageCode}`. */
export const LANGUAGE_SINGLETON_TYPES = [
  "homePage",
  "navigation",
  "footer",
] as const;

/** Regular documents that belong to one language (created from the per-language lists). */
export const LANGUAGE_DOCUMENT_TYPES = ["page", "project", "service"] as const;

/** Every schema type that must never be created, duplicated or deleted by editors. */
export const SINGLETON_TYPES = new Set<string>([
  SITE_SETTINGS_ID,
  ...LANGUAGE_SINGLETON_TYPES,
]);

/** Document actions removed from singletons. */
export const SINGLETON_HIDDEN_ACTIONS = new Set([
  "delete",
  "duplicate",
  "unpublish",
]);

/** Fixed document id for a per-language singleton, e.g. `homePage-fr`. */
export function singletonId(type: string, languageCode: string): string {
  return `${type}-${languageCode}`;
}

/** Initial value template id that presets the language, e.g. `page-fr`. */
export function languageTemplateId(type: string, languageCode: string): string {
  return `${type}-${languageCode}`;
}

/** Human titles used for template names ("Page (Fr)"). */
const TYPE_TITLES: Record<string, string> = {
  homePage: "Home page",
  navigation: "Navigation menu",
  footer: "Footer & contact form",
  page: "Page",
  project: "Portfolio project",
  service: "Service",
};

/**
 * Initial value templates that preset the `language` field, one per type and
 * language. The desk structure uses them for its "Create" buttons and for the
 * per-language singletons.
 */
export const languageTemplates = [
  ...LANGUAGE_SINGLETON_TYPES,
  ...LANGUAGE_DOCUMENT_TYPES,
].flatMap((type) =>
  languages.map((language) => ({
    id: languageTemplateId(type, language.id),
    title: `${TYPE_TITLES[type]} (${language.title})`,
    schemaType: type,
    value: { language: language.id },
  })),
);

/**
 * Template ids hidden from every "Create new document" menu: singletons
 * (they are opened directly from the desk) and the plain language-less
 * templates of regular documents (editors use "Page (En)" etc. instead).
 */
export const hiddenTemplateIds = new Set<string>([
  ...SINGLETON_TYPES,
  ...LANGUAGE_DOCUMENT_TYPES,
  ...LANGUAGE_SINGLETON_TYPES.flatMap((type) =>
    languages.map((language) => languageTemplateId(type, language.id)),
  ),
]);
