import { TagIcon } from "@sanity/icons/Tag";
import { defineField, defineType } from "sanity";

/** A small colored label next to a menu link, e.g. "NEW" or "FREE". */
export const menuBadge = defineType({
  name: "menuBadge",
  title: "Badge",
  type: "object",
  icon: TagIcon,
  description: "Optional. Leave the label empty to show no badge.",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: "label",
      title: "Badge text",
      type: "string",
      description: 'Very short text, e.g. "NEW", "FREE" or "HOT".',
      validation: (rule) =>
        rule.max(12).warning("Badges look best with 12 characters or fewer."),
    }),
    defineField({
      name: "color",
      title: "Badge color",
      type: "string",
      description: "Colors come from the website theme.",
      options: {
        list: [
          { title: "Primary", value: "primary" },
          { title: "Accent", value: "accent" },
          { title: "Info (blue)", value: "info" },
          { title: "Success (green)", value: "success" },
          { title: "Danger (red)", value: "danger" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { label?: string } | undefined;
          return parent?.label && !value
            ? "Choose a color for the badge."
            : true;
        }),
    }),
  ],
});
