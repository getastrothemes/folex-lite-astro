/**
 * Connects Studio documents to website URLs for the Presentation tool:
 *
 * - `locations`: "Used on these pages" links shown on top of each document.
 * - `mainDocuments`: which document to open when you browse to a URL in the
 *   preview, e.g. /fr/portfolio/my-project/ opens that French project.
 *
 * URL rules (trailing slash always, default language has no prefix):
 *   Home      /            /fr/
 *   Page      /{slug}/     /fr/{slug}/
 *   Project   /portfolio/{slug}/   /fr/portfolio/{slug}/
 */
import {
  defineDocuments,
  defineLocations,
  type PresentationPluginOptions,
} from "sanity/presentation";
import {
  homePath,
  languagePrefix,
  languages,
  languageTitle,
  pagePath,
  projectPath,
} from "../lib/languages";

/** Both the slash and no-slash version of a route pattern. */
function withAndWithoutSlash(path: string): string[] {
  const trimmed = path.replace(/\/+$/, "");
  return trimmed ? [trimmed, `${trimmed}/`] : ["/"];
}

/** A location pointing at the home page of a language. */
function homeLocation(language?: string) {
  return {
    title: `Home page (${languageTitle(language) || "default"})`,
    href: homePath(language),
  };
}

const locations: NonNullable<
  PresentationPluginOptions["resolve"]
>["locations"] = {
  homePage: defineLocations({
    select: { title: "title", language: "language" },
    resolve: (doc) => ({ locations: [homeLocation(doc?.language)] }),
  }),

  page: defineLocations({
    select: { title: "title", slug: "slug.current", language: "language" },
    resolve: (doc) =>
      doc?.slug
        ? {
            locations: [
              {
                title: doc.title || "Untitled page",
                href: pagePath(doc.language, doc.slug),
              },
            ],
          }
        : { message: "Add a URL slug to preview this page.", tone: "caution" },
  }),

  project: defineLocations({
    select: { title: "title", slug: "slug.current", language: "language" },
    resolve: (doc) =>
      doc?.slug
        ? {
            locations: [
              {
                title: doc.title || "Untitled project",
                href: projectPath(doc.language, doc.slug),
              },
              homeLocation(doc.language),
            ],
          }
        : {
            message: "Add a URL slug to preview this project.",
            tone: "caution",
          },
  }),

  service: defineLocations({
    select: { title: "title", language: "language" },
    resolve: (doc) => ({ locations: [homeLocation(doc?.language)] }),
  }),

  navigation: defineLocations({
    select: { language: "language" },
    resolve: (doc) => ({
      message: "This menu is shown on every page of this language.",
      tone: "positive",
      locations: [homeLocation(doc?.language)],
    }),
  }),

  footer: defineLocations({
    select: { language: "language" },
    resolve: (doc) => ({
      message: "This footer is shown on every page of this language.",
      tone: "positive",
      locations: [homeLocation(doc?.language)],
    }),
  }),

  siteSettings: defineLocations({
    message: "Site settings are used on every page.",
    tone: "positive",
    locations: languages.map((language) => homeLocation(language.id)),
  }),
};

/**
 * Route → document rules. Prefixed languages come first so "/fr/" is never
 * mistaken for a default-language page with the slug "fr", and portfolio
 * routes come before generic page routes.
 */
const prefixedFirst = [...languages].sort(
  (a, b) => Number(a.isDefault) - Number(b.isDefault),
);

const mainDocuments = defineDocuments(
  prefixedFirst.flatMap((language) => {
    const prefix = languagePrefix(language.id);
    return [
      {
        route: withAndWithoutSlash(prefix || "/"),
        filter: `_type == "homePage" && language == $language`,
        params: { language: language.id },
      },
      {
        route: withAndWithoutSlash(`${prefix}/portfolio/:slug`),
        filter: `_type == "project" && slug.current == $slug && language == $language`,
        params: ({ params }: { params: Record<string, string> }) => ({
          slug: params.slug,
          language: language.id,
        }),
      },
      {
        route: withAndWithoutSlash(`${prefix}/:slug`),
        filter: `_type == "page" && slug.current == $slug && language == $language`,
        params: ({ params }: { params: Record<string, string> }) => ({
          slug: params.slug,
          language: language.id,
        }),
      },
    ];
  }),
);

export const resolve: PresentationPluginOptions["resolve"] = {
  locations,
  mainDocuments,
};
