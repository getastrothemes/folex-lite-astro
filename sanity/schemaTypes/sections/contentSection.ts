import { BlockContentIcon } from "@sanity/icons/BlockContent";
import { defineField, defineType } from "sanity";
import { hiddenSectionField } from "../../lib/fields";
import { sectionTitle } from "../../lib/preview";

/** Free rich text, styled like the legal pages. */
export const contentSection = defineType({
  name: "contentSection",
  title: "Text content",
  type: "object",
  icon: BlockContentIcon,
  description:
    "Free text with headings, lists, links and images, e.g. an intro or terms.",
  fields: [
    hiddenSectionField(false),
    defineField({
      name: "title",
      title: "Heading",
      type: "string",
      description: "Optional heading above the text.",
    }),
    defineField({
      name: "body",
      title: "Text",
      type: "portableText",
    }),
  ],
  preview: {
    select: { title: "title", hidden: "hidden" },
    prepare: ({ title, hidden }) => ({
      title: sectionTitle("Text content", title, hidden),
      subtitle: "Text content section",
      media: BlockContentIcon,
    }),
  },
});
