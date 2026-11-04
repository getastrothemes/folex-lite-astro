import { ProjectsIcon } from "@sanity/icons/Projects";
import { defineArrayMember, defineField, defineType } from "sanity";
import { hiddenSectionField, sectionGroups } from "../../lib/fields";
import { sectionTitle } from "../../lib/preview";

/** Grid of portfolio project cards. */
export const portfolioSection = defineType({
  name: "portfolioSection",
  title: "Portfolio",
  type: "object",
  icon: ProjectsIcon,
  description:
    "Cards linking to your portfolio projects, in a grid or masonry layout.",
  groups: sectionGroups,
  fields: [
    hiddenSectionField(),
    defineField({
      name: "title",
      title: "Heading",
      type: "string",
      group: "content",
      description: 'e.g. "Our latest works".',
    }),
    defineField({
      name: "projects",
      title: "Projects to show",
      type: "array",
      group: "content",
      description:
        'Leave empty to show the latest projects of this language (sorted by "Order", then newest date). Or pick projects and drag them into order.',
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "project" }],
          options: {
            disableNew: true,
            // Only offer projects written in the same language as this page.
            filter: ({ document }) =>
              document?.language
                ? {
                    filter: "language == $language",
                    params: { language: document.language },
                  }
                : { filter: "true" },
          },
        }),
      ],
      validation: (rule) =>
        rule.unique().error("Each project can only be added once."),
    }),
    defineField({
      name: "button",
      title: "Button",
      type: "link",
      group: "content",
      description: "Optional button under the projects.",
      initialValue: { enabled: false, label: "View all works", url: "/" },
    }),
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      group: "settings",
      options: {
        list: [
          { title: "Grid", value: "grid" },
          { title: "Masonry", value: "masonry" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "grid",
    }),
    defineField({
      name: "appearance",
      title: "Appearance",
      type: "string",
      group: "settings",
      description: "Light or dark background.",
      options: {
        list: [
          { title: "Light", value: "light" },
          { title: "Dark", value: "dark" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "light",
    }),
    defineField({
      name: "limit",
      title: "Maximum number of projects",
      type: "number",
      group: "settings",
      description: "How many projects to show. Leave empty to show all.",
      initialValue: 4,
      validation: (rule) =>
        rule.integer().min(1).error("Use a whole number of 1 or more."),
    }),
  ],
  preview: {
    select: {
      title: "title",
      hidden: "hidden",
      layout: "layout",
      limit: "limit",
    },
    prepare: ({ title, hidden, layout, limit }) => ({
      title: sectionTitle("Portfolio", title, hidden),
      subtitle: `${layout === "masonry" ? "Masonry" : "Grid"}${limit ? ` · up to ${limit} projects` : ""}`,
      media: ProjectsIcon,
    }),
  },
});
