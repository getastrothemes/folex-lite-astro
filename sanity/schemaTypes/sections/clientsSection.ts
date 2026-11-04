import { UsersIcon } from "@sanity/icons/Users";
import { defineField, defineType } from "sanity";
import {
  hiddenSectionField,
  imageArrayMember,
  sectionGroups,
} from "../../lib/fields";
import { arrayLength, countLabel, sectionTitle } from "../../lib/preview";

/** A grid of client or partner logos. */
export const clientsSection = defineType({
  name: "clientsSection",
  title: "Clients",
  type: "object",
  icon: UsersIcon,
  description: "A grid of client or partner logos.",
  groups: sectionGroups,
  fields: [
    hiddenSectionField(),
    defineField({
      name: "title",
      title: "Heading",
      type: "string",
      group: "content",
      description:
        'Optional, e.g. "Trusted by great teams". Leave empty to show only the logos.',
    }),
    defineField({
      name: "logos",
      title: "Logos",
      type: "array",
      group: "content",
      description:
        "Logos are shown 32 px tall in a grid of boxes. SVG or transparent PNG works best. Add the company name as alternative text.",
      of: [imageArrayMember("Logo")],
      options: { layout: "grid" },
    }),
    defineField({
      name: "appearance",
      title: "Text color",
      type: "string",
      group: "settings",
      description:
        'This section has no background of its own. Keep "Dark text" on normal (white) pages. "White text" makes the heading and grid lines white, which is only readable on a dark page background.',
      options: {
        list: [
          { title: "Dark text (for white pages)", value: "light" },
          { title: "White text (for dark pages)", value: "dark" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "light",
    }),
    defineField({
      name: "columnsPerRow",
      title: "Logos per row",
      type: "number",
      group: "settings",
      description:
        "Logos per row on large screens. Phones always show 2 per row; with 6, tablets show 3 per row and the grid uses the full page width.",
      options: {
        list: [
          { title: "4 logos", value: 4 },
          { title: "6 logos", value: 6 },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: 4,
    }),
  ],
  preview: {
    // Select only `logos` (no `logos.0`): selecting both a path and one of its
    // children makes Sanity pass the array as a plain object, so it can't be
    // counted. The first logo is taken from the array instead.
    select: { title: "title", hidden: "hidden", logos: "logos" },
    prepare: ({ title, hidden, logos }) => {
      const firstLogo = Array.isArray(logos)
        ? logos.find((logo) => logo?.asset)
        : undefined;
      return {
        title: sectionTitle("Clients", title, hidden),
        subtitle: countLabel(arrayLength(logos), "logo"),
        media: firstLogo ?? UsersIcon,
      };
    },
  },
});
