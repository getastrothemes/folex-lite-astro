import { UsersIcon } from "@sanity/icons/Users";
import { defineField, defineType } from "sanity";
import {
  hiddenSectionField,
  imageArrayMember,
  sectionGroups,
} from "../../lib/fields";
import { sectionTitle } from "../../lib/preview";

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
        'Optional, e.g. "Trusted by great teams". Leave empty for logos only.',
    }),
    defineField({
      name: "logos",
      title: "Logos",
      type: "array",
      group: "content",
      description:
        "Upload logos (SVG or transparent PNG work best). Add the company name as alternative text.",
      of: [imageArrayMember("Logo")],
      options: { layout: "grid" },
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
      name: "columnsPerRow",
      title: "Logos per row",
      type: "number",
      group: "settings",
      description: "How many logos fit in one row on large screens.",
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
    select: {
      title: "title",
      hidden: "hidden",
      logos: "logos",
      media: "logos.0",
    },
    prepare: ({ title, hidden, logos, media }) => ({
      title: sectionTitle("Clients", title, hidden),
      subtitle: `${logos?.length ?? 0} logo${logos?.length === 1 ? "" : "s"}`,
      media: media ?? UsersIcon,
    }),
  },
});
