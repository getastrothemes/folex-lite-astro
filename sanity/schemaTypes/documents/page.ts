import { DocumentIcon } from "@sanity/icons/Document";
import { defineField, defineType } from "sanity";
import { documentGroups, imageField, languageField } from "../../lib/fields";
import {
  languageTitle,
  pagePath,
  reservedPageSlugs,
} from "../../lib/languages";
import {
  isUniqueSlugPerLanguage,
  validateSlugValue,
} from "../../lib/validation";

/** A regular page such as "About", "Privacy policy" or "Terms". */
export const page = defineType({
  name: "page",
  title: "Page",
  type: "document",
  icon: DocumentIcon,
  groups: documentGroups,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      description:
        'The page heading and browser tab title, e.g. "Privacy policy". The heading is not shown when the page starts with a Banner section and has no page text or cover image (the banner has its own heading).',
      validation: (rule) => [
        rule.required().error("Add a page title."),
        rule
          .max(80)
          .warning("Shorter titles read better (80 characters or fewer)."),
      ],
    }),
    defineField({
      name: "slug",
      title: "URL slug",
      type: "slug",
      group: "content",
      description:
        'The last part of the page address, e.g. "privacy-policy" for /privacy-policy/. Click "Generate" to create it from the title.',
      options: {
        source: "title",
        maxLength: 96,
        isUnique: isUniqueSlugPerLanguage,
      },
      // One rule only: Sanity adds its uniqueness check to every rule of a slug field.
      validation: (rule) =>
        rule
          .custom((value) => validateSlugValue(value, reservedPageSlugs))
          .error(),
    }),
    imageField({
      name: "image",
      title: "Cover image",
      group: "content",
      description:
        "Optional wide image shown above the page heading. Also used when the page is shared on social media (unless the SEO tab has its own image).",
    }),
    defineField({
      name: "body",
      title: "Page text",
      type: "portableText",
      group: "content",
      description:
        "Optional main text under the page heading, with headings, lists, links and images.",
    }),
    defineField({
      name: "sections",
      title: "Page sections",
      type: "pageSections",
      group: "content",
      description:
        "Optional building blocks shown after the page text, top to bottom. Click “Add item” to add a section and drag to reorder.",
    }),
    defineField({
      name: "seo",
      title: "SEO & social sharing",
      type: "seo",
      group: "seo",
    }),
    languageField({ group: "settings" }),
  ],
  orderings: [
    {
      title: "Title A–Z",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
    {
      title: "Last edited",
      name: "updatedDesc",
      by: [{ field: "_updatedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      slug: "slug.current",
      language: "language",
      media: "image",
    },
    prepare: ({ title, slug, language, media }) => ({
      title: title || "Untitled page",
      subtitle: `${languageTitle(language)} · ${slug ? pagePath(language, slug) : "No URL yet"}`,
      media: media ?? DocumentIcon,
    }),
  },
});
