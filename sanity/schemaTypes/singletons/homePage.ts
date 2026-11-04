import { HomeIcon } from "@sanity/icons/Home";
import { defineField, defineType } from "sanity";
import { documentGroups, languageField } from "../../lib/fields";
import { homePath, languageTitle } from "../../lib/languages";

/** The home page of one language (one document per language). */
export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  icon: HomeIcon,
  groups: documentGroups,
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      description:
        'Used as the browser tab title, e.g. "Home" (the SEO tab\'s meta title wins when set). Not shown on the page itself.',
      validation: (rule) => rule.required().error("Add a title."),
    }),
    defineField({
      name: "sections",
      title: "Page sections",
      type: "pageSections",
      group: "content",
      description:
        "The building blocks of the home page, top to bottom. Drag to reorder. Start with a Banner so the header sits on top of it.",
    }),
    defineField({
      name: "seo",
      title: "SEO & social sharing",
      type: "seo",
      group: "seo",
    }),
    languageField({ readOnly: true, group: "settings" }),
  ],
  preview: {
    select: { title: "title", language: "language" },
    prepare: ({ title, language }) => ({
      title: title || "Home page",
      subtitle: `Home page · ${languageTitle(language)} · ${homePath(language)}`,
      media: HomeIcon,
    }),
  },
});
