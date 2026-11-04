import { WrenchIcon } from "@sanity/icons/Wrench";
import { defineArrayMember, defineField, defineType } from "sanity";
import { hiddenSectionField, sectionGroups } from "../../lib/fields";
import { sectionTitle } from "../../lib/preview";

/** Accordion list of services. */
export const servicesSection = defineType({
  name: "servicesSection",
  title: "Services",
  type: "object",
  icon: WrenchIcon,
  description:
    "Your services in an expandable list. Shows all services automatically, or the ones you pick.",
  groups: sectionGroups,
  fields: [
    hiddenSectionField(),
    defineField({
      name: "title",
      title: "Heading",
      type: "string",
      group: "content",
      description: 'e.g. "What we do".',
    }),
    defineField({
      name: "services",
      title: "Services to show",
      type: "array",
      group: "content",
      description:
        'Leave empty to show all services of this language (sorted by their "Order" number). Or pick specific services and drag them into order.',
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "service" }],
          options: {
            disableNew: true,
            // Only offer services written in the same language as this page.
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
        rule.unique().error("Each service can only be added once."),
    }),
    defineField({
      name: "sectionDirection",
      title: "Layout",
      type: "string",
      group: "settings",
      description:
        "Heading above the list (vertical) or beside it (horizontal).",
      options: {
        list: [
          { title: "Vertical", value: "vertical" },
          { title: "Horizontal", value: "horizontal" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "vertical",
    }),
    defineField({
      name: "limit",
      title: "Maximum number of services",
      type: "number",
      group: "settings",
      description: "Optional. Leave empty to show every service.",
      validation: (rule) =>
        rule.integer().min(1).error("Use a whole number of 1 or more."),
    }),
  ],
  preview: {
    select: { title: "title", hidden: "hidden", services: "services" },
    prepare: ({ title, hidden, services }) => ({
      title: sectionTitle("Services", title, hidden),
      subtitle: services?.length
        ? `${services.length} selected services`
        : "All services",
      media: WrenchIcon,
    }),
  },
});
