import { CaseIcon } from "@sanity/icons/Case";
import { defineArrayMember, defineField, defineType } from "sanity";
import {
  documentGroups,
  imageArrayMember,
  imageField,
  languageField,
} from "../../lib/fields";
import { languageTitle, projectPath } from "../../lib/languages";
import {
  isUniqueSlugPerLanguage,
  validateSlugValue,
} from "../../lib/validation";

/** A portfolio case study with cover image, gallery and story. */
export const project = defineType({
  name: "project",
  title: "Portfolio project",
  type: "document",
  icon: CaseIcon,
  groups: documentGroups,
  fields: [
    defineField({
      name: "title",
      title: "Project name",
      type: "string",
      group: "content",
      description: 'e.g. "Brand identity for a coffee roaster".',
      validation: (rule) => [
        rule.required().error("Add a project name."),
        rule
          .max(80)
          .warning(
            "Shorter names fit the cards better (80 characters or fewer).",
          ),
      ],
    }),
    defineField({
      name: "slug",
      title: "URL slug",
      type: "slug",
      group: "content",
      description:
        'The last part of the address, e.g. "coffee-branding" for /portfolio/coffee-branding/. Click "Generate" to create it from the name.',
      options: {
        source: "title",
        maxLength: 96,
        isUnique: isUniqueSlugPerLanguage,
      },
      // One rule only: Sanity adds its uniqueness check to every rule of a slug field.
      validation: (rule) =>
        rule.custom((value) => validateSlugValue(value, [])).error(),
    }),
    defineField({
      name: "description",
      title: "Short summary",
      type: "text",
      rows: 3,
      group: "content",
      description: "One or two sentences shown on project cards.",
      validation: (rule) =>
        rule
          .max(200)
          .warning("Keep the summary short (200 characters or fewer)."),
    }),
    imageField({
      name: "coverImage",
      title: "Cover image",
      group: "content",
      required: true,
      description:
        "Main image used on project cards and at the top of the project page.",
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      group: "content",
      description:
        "Extra images shown in a slider on the project page. Drag to reorder.",
      of: [imageArrayMember()],
      options: { layout: "grid" },
    }),
    defineField({
      name: "categories",
      title: "Categories",
      type: "array",
      group: "content",
      description:
        'Press Enter after each category, e.g. "Branding", "Development".',
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
    defineField({
      name: "details",
      title: "Project details",
      type: "array",
      group: "content",
      description:
        'Facts listed beside the story, e.g. "Client: Eunice Mills" or "Software: Figma".',
      of: [defineArrayMember({ type: "projectDetail" })],
    }),
    defineField({
      name: "body",
      title: "Project story",
      type: "portableText",
      group: "content",
      description: "The challenge, the solution and the results.",
    }),
    defineField({
      name: "seo",
      title: "SEO & social sharing",
      type: "seo",
      group: "seo",
    }),
    defineField({
      name: "date",
      title: "Project date",
      type: "date",
      group: "settings",
      description:
        "When the project was finished. Newer projects are listed first.",
      options: { dateFormat: "MMMM D, YYYY" },
      initialValue: () => new Date().toISOString().slice(0, 10),
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      group: "settings",
      description:
        "Optional. Lower numbers are shown first (1, 2, 3…). Leave empty to sort by date.",
      validation: (rule) => rule.integer().error("Use a whole number, e.g. 1."),
    }),
    languageField({ group: "settings" }),
  ],
  orderings: [
    {
      title: "Website order",
      name: "orderAsc",
      by: [
        { field: "order", direction: "asc" },
        { field: "date", direction: "desc" },
      ],
    },
    {
      title: "Newest first",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      slug: "slug.current",
      language: "language",
      media: "coverImage",
    },
    prepare: ({ title, slug, language, media }) => ({
      title: title || "Untitled project",
      subtitle: `${languageTitle(language)} · ${slug ? projectPath(language, slug) : "No URL yet"}`,
      media: media ?? CaseIcon,
    }),
  },
});
