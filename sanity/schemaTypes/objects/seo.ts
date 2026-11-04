import { SearchIcon } from "@sanity/icons/Search";
import { defineField, defineType } from "sanity";
import { imageField } from "../../lib/fields";

/** Per-page search engine and social sharing settings. */
export const seo = defineType({
  name: "seo",
  title: "SEO & social sharing",
  type: "object",
  icon: SearchIcon,
  options: { collapsible: true, collapsed: false },
  fields: [
    defineField({
      name: "metaTitle",
      title: "Meta title",
      type: "string",
      description:
        'Title shown in Google results and browser tabs, e.g. "About us". The tagline from Site settings is added after it. Leave empty to use the page title.',
      validation: (rule) =>
        rule
          .max(60)
          .warning(
            "Search engines usually cut titles longer than 60 characters.",
          ),
    }),
    defineField({
      name: "metaDescription",
      title: "Meta description",
      type: "text",
      rows: 3,
      description:
        "One or two sentences shown under the title in search results. Leave empty to use the project summary (for projects) or the site description from Site settings.",
      validation: (rule) =>
        rule
          .max(160)
          .warning(
            "Search engines usually cut descriptions longer than 160 characters.",
          ),
    }),
    imageField({
      name: "ogImage",
      title: "Social sharing image",
      description:
        "Shown when this page is shared on social media, cropped to 1200 × 630 px. Leave empty to use the cover image, or else the default sharing image from Site settings.",
    }),
    defineField({
      name: "noIndex",
      title: "Hide from search engines",
      type: "boolean",
      description:
        "Turn on to ask Google and other search engines not to list this page.",
      initialValue: false,
    }),
  ],
});
