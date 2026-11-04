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
      description: 'Shown as the page heading, e.g. "Privacy policy".',
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
      description: "Optional image shown at the top of the page.",
    }),
    defineField({
      name: "body",
      title: "Page text",
      type: "portableText",
      group: "content",
      description:
        "Optional main text of the page, with headings, lists and links.",
    }),
    defineField({
      name: "sections",
      title: "Page sections",
      type: "pageSections",
      group: "content",
      description:
        "Optional building blocks shown after the page text. Click “Add item” to add a section.",
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
