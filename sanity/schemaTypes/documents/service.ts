import { WrenchIcon } from "@sanity/icons/Wrench";
import { defineField, defineType } from "sanity";
import { languageField } from "../../lib/fields";
import { languageTitle } from "../../lib/languages";
import { shorten } from "../../lib/preview";

/** A service listed in the Services section accordion. */
export const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  icon: WrenchIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "settings", title: "Settings" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Service name",
      type: "string",
      group: "content",
      description: 'e.g. "Branding Design".',
      validation: (rule) => [
        rule.required().error("Add a service name."),
        rule
          .max(60)
          .warning("Shorter names look better (60 characters or fewer)."),
      ],
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
      group: "content",
      description:
        "Shown when a visitor opens the service. You can use **bold text** and links like [Contact us](/contact/).",
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      group: "settings",
      description: "Lower numbers are shown first (1, 2, 3…).",
      validation: (rule) => rule.integer().error("Use a whole number, e.g. 1."),
    }),
    languageField({ group: "settings" }),
  ],
  orderings: [
    {
      title: "Website order",
      name: "orderAsc",
      by: [{ field: "order", direction: "asc" }],
    },
    {
      title: "Name A–Z",
      name: "titleAsc",
      by: [{ field: "title", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      description: "description",
      language: "language",
      order: "order",
    },
    prepare: ({ title, description, language, order }) => ({
      title: `${typeof order === "number" ? `${order}. ` : ""}${title || "Untitled service"}`,
      subtitle: `${languageTitle(language)} · ${shorten(description, 60) || "No description yet"}`,
    }),
  },
});
