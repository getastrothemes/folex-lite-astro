import type { Collection, TinaField } from "tinacms";
import { PAGE_SECTIONS } from "../../src/lib/pageSections";
import {
  pagesCollectionName,
  portfolioCollectionName,
  servicesCollectionName,
} from "../../src/lib/tina/names";
import {
  bodyField,
  dateField,
  seoFields,
  slugField,
  slugify,
  weightField,
} from "../fields";
import {
  LANGUAGES,
  VISUAL_EDITING,
  docLanguage,
  localeUrl,
  type Language,
} from "../site";

// Page-like collections: homepage, pages, portfolio items and services.
// Pages, portfolio and services get one collection per language folder so new
// entries are always created in the right place.

const sectionsField = (withPageText: boolean): TinaField => ({
  type: "object",
  name: "sections",
  label: "Page sections",
  list: true,
  description: withPageText
    ? 'Add, remove and drag to reorder the blocks of this page. "Page text" shows the Content field below. Leave empty to show only the page text. Edit a section\'s own content under "Section" in the menu, or click it in the preview.'
    : "Add, remove and drag to reorder the homepage blocks. Leave empty to use the default order. Edit a section's own content by clicking it in the preview.",
  ui: {
    itemProps: (item: { section?: keyof typeof PAGE_SECTIONS }) => ({
      label: item?.section
        ? PAGE_SECTIONS[item.section]?.label
        : "Choose a section",
    }),
    defaultItem: () => ({ section: withPageText ? "content" : "banner" }),
  },
  fields: [
    {
      type: "string",
      name: "section",
      label: "Section",
      required: true,
      options: Object.entries(PAGE_SECTIONS)
        .filter(([key]) => withPageText || key !== "content")
        .map(([value, { label }]) => ({ value, label })),
    },
  ],
});

const titleField = (description: string): TinaField => ({
  type: "string",
  name: "title",
  label: "Title",
  isTitle: true,
  required: true,
  description,
});

// e.g. "Pages · English" (from the language's content folder name)
const languageLabel = (lang: Language) =>
  LANGUAGES.length > 1
    ? ` · ${lang.contentDir.charAt(0).toUpperCase()}${lang.contentDir.slice(1)}`
    : "";

const slugFor = (document: {
  customSlug?: string | null;
  _sys: { filename: string };
}) => document.customSlug || document._sys.filename;

export const homepageCollection: Collection = {
  name: "homepage",
  label: "Homepage",
  path: "src/content/homepage",
  format: "md",
  match: { include: `{${LANGUAGES.map((l) => l.contentDir).join(",")}}/-index` },
  ui: {
    allowedActions: { create: false, delete: false, createFolder: false },
    router: VISUAL_EDITING
      ? ({ document }) => localeUrl(docLanguage(document).languageCode)
      : undefined,
  },
  fields: [
    titleField("Used for the browser tab and search results."),
    sectionsField(false),
    ...seoFields({ withDraft: false }),
  ],
};

export const pagesCollection = (lang: Language): Collection => ({
  name: pagesCollectionName(lang.languageCode),
  label: `Pages${languageLabel(lang)}`,
  path: `src/content/pages/${lang.contentDir}`,
  format: "md",
  defaultItem: () => ({ draft: false }),
  ui: {
    allowedActions: { createFolder: false, createNestedFolder: false },
    filename: {
      slugify: (values) => slugify(values?.title),
      description:
        "This becomes the web address, e.g. about-us gives /about-us/. Use the same file name in every language.",
    },
    router: VISUAL_EDITING
      ? ({ document }) =>
          localeUrl(lang.languageCode, slugFor(document as never))
      : undefined,
  },
  fields: [
    titleField("The main heading of the page."),
    {
      type: "string",
      name: "description",
      label: "Short description",
      description: "Used for search results when the SEO description is empty.",
      ui: { component: "textarea" },
    },
    sectionsField(true),
    { ...dateField, description: "Optional. Shown above the title." },
    {
      type: "string",
      name: "categories",
      label: "Categories",
      list: true,
      description: "Optional labels shown above the title.",
    },
    slugField,
    bodyField(
      'The text of the page. Tip: add [.text-h3] at the end of a heading to make it smaller, e.g. "Our story [.text-h3]".',
    ),
    ...seoFields(),
  ],
});

export const portfolioCollection = (lang: Language): Collection => ({
  name: portfolioCollectionName(lang.languageCode),
  label: `Portfolio${languageLabel(lang)}`,
  path: `src/content/portfolio/${lang.contentDir}`,
  format: "mdx",
  defaultItem: () => ({ draft: false, date: new Date().toISOString() }),
  ui: {
    allowedActions: { createFolder: false, createNestedFolder: false },
    filename: {
      slugify: (values) => slugify(values?.title),
      description:
        "Used in the web address unless a custom slug is set. Use the same file name in every language.",
    },
    router: VISUAL_EDITING
      ? ({ document }) =>
          localeUrl(lang.languageCode, `portfolio/${slugFor(document as never)}`)
      : undefined,
  },
  fields: [
    titleField("Project name, shown on the card and the project page."),
    {
      type: "image",
      name: "image",
      label: "Cover image",
      description: "Shown on the portfolio card. Use a landscape image.",
    },
    {
      type: "image",
      name: "images",
      label: "Gallery images",
      list: true,
      description:
        "Shown as a slider on the project page when there are two or more images.",
    },
    {
      type: "string",
      name: "description",
      label: "Short description",
      ui: { component: "textarea" },
    },
    {
      type: "string",
      name: "categories",
      label: "Categories",
      list: true,
      description: 'Shown on the card, e.g. "Branding".',
    },
    dateField,
    {
      type: "object",
      name: "information",
      label: "Project details",
      list: true,
      description:
        'Facts shown next to the project text. Type "categories" or "date" as a value to show the project\'s categories or date automatically.',
      ui: {
        itemProps: (item: { label?: string; value?: string }) => ({
          label: [item?.label, item?.value].filter(Boolean).join(" ") || "Detail",
        }),
        defaultItem: () => ({ label: "Client:", value: "" }),
      },
      fields: [
        { type: "string", name: "label", label: "Label", required: true },
        { type: "string", name: "value", label: "Value", required: true },
      ],
    },
    slugField,
    weightField,
    bodyField(
      'The project story. Tip: add [.text-h3] at the end of a heading to make it smaller, e.g. "Final Result [.text-h3]".',
    ),
    ...seoFields({ withImage: false }),
  ],
});

export const servicesCollection = (lang: Language): Collection => ({
  name: servicesCollectionName(lang.languageCode),
  label: `Services${languageLabel(lang)}`,
  path: `src/content/services/${lang.contentDir}`,
  format: "mdx",
  match: { exclude: "-index" },
  defaultItem: () => ({ draft: false, date: new Date().toISOString() }),
  ui: {
    allowedActions: { createFolder: false, createNestedFolder: false },
    filename: {
      slugify: (values) => slugify(values?.title),
    },
    router: VISUAL_EDITING
      ? () => localeUrl(lang.languageCode)
      : undefined,
  },
  fields: [
    titleField("Service name, shown in the homepage services list."),
    {
      type: "string",
      name: "description",
      label: "Description",
      description: "Shown when a visitor opens the service in the list. Markdown is allowed.",
      ui: { component: "textarea" },
    },
    weightField,
    {
      type: "image",
      name: "icon",
      label: "Icon",
      description: "SVG icon. Used by the Pro grid layout.",
    },
    {
      type: "image",
      name: "image",
      label: "Image",
      description: "Used by the Pro service detail page.",
    },
    slugField,
    dateField,
    {
      type: "boolean",
      name: "draft",
      label: "Draft (hidden from the live website)",
    },
    { type: "string", name: "metaTitle", label: "SEO title" },
    {
      type: "string",
      name: "metaDescription",
      label: "SEO description",
      ui: { component: "textarea" },
    },
    {
      type: "rich-text",
      name: "body",
      label: "Detail page content",
      isBody: true,
      // The Lite theme has no service detail page, so this is kept as is.
      ui: { component: "hidden" },
    },
  ],
});

