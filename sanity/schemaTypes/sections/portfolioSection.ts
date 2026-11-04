import { ProjectsIcon } from "@sanity/icons/Projects";
import { defineArrayMember, defineField, defineType } from "sanity";
import { hiddenSectionField, sectionGroups } from "../../lib/fields";
import { arrayLength, countLabel, sectionTitle } from "../../lib/preview";

/** Grid of portfolio project cards. */
export const portfolioSection = defineType({
  name: "portfolioSection",
  title: "Portfolio",
  type: "object",
  icon: ProjectsIcon,
  description:
    "Cards linking to your portfolio projects, in two columns on large screens.",
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
        'Leave empty to show the projects of this page\'s language automatically (sorted by "Order", then newest date). Or pick projects and drag them into order. Projects are edited under "Portfolio projects" in the sidebar.',
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
      description: "Not shown on the website by this theme.",
      // Kept for compatibility with existing content, but the Portfolio section
      // of this theme never renders a button, so editors don't see it.
      hidden: true,
      initialValue: { enabled: false, label: "View all works", url: "/" },
    }),
    defineField({
      name: "layout",
      title: "Layout",
      type: "string",
      group: "settings",
      description:
        "Grid: evenly spaced cards with the categories under the project name. Masonry: tighter cards with the categories above the name.",
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
      description:
        "Light: no background (white page). Dark: the section gets a dark background with white text.",
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
      description:
        "How many projects to show, e.g. 4. Leave empty to show all of them.",
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
      projects: "projects",
    },
    prepare: ({ title, hidden, layout, limit, projects }) => {
      const picked = arrayLength(projects);
      return {
        title: sectionTitle("Portfolio", title, hidden),
        subtitle: [
          layout === "masonry" ? "Masonry" : "Grid",
          picked
            ? countLabel(picked, "selected project")
            : "All projects of this language",
          limit ? `max ${limit}` : "",
        ]
          .filter(Boolean)
          .join(" · "),
        media: ProjectsIcon,
      };
    },
  },
});
