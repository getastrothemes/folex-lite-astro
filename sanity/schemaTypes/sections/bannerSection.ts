import { RocketIcon } from "@sanity/icons/Rocket";
import { defineField, defineType } from "sanity";
import {
  hiddenSectionField,
  imageField,
  sectionGroups,
} from "../../lib/fields";
import { sectionTitle } from "../../lib/preview";

/** Big hero area at the top of a page: heading, text, image and a button. */
export const bannerSection = defineType({
  name: "bannerSection",
  title: "Banner",
  type: "object",
  icon: RocketIcon,
  description:
    "Large heading on a black background with text, an optional button and an image. Use it as the first section: the header then sits on top of it.",
  groups: sectionGroups,
  fields: [
    hiddenSectionField(),
    defineField({
      name: "title",
      title: "Heading",
      type: "text",
      rows: 2,
      group: "content",
      description:
        'Press Enter to start a new line on the website, e.g. "We Help to Grow" ↵ "Your Business". Use **double asterisks** for bold text.',
      validation: (rule) =>
        rule
          .max(120)
          .warning(
            "Long headings are hard to read. Try 120 characters or fewer.",
          ),
    }),
    defineField({
      name: "description",
      title: "Text",
      type: "text",
      rows: 3,
      group: "content",
      description: "A sentence or two under the heading (above the button).",
    }),
    imageField({
      name: "image",
      title: "Image",
      group: "content",
      description:
        "Wide picture shown under the text in a landscape frame (the center of the image stays visible). Use an image at least 1800 px wide.",
    }),
    defineField({
      name: "button",
      title: "Button",
      type: "link",
      group: "content",
      description: "Optional button under the text.",
      initialValue: { enabled: false, label: "View our works", url: "/" },
    }),
    defineField({
      name: "titleSize",
      title: "Heading size",
      type: "string",
      group: "settings",
      description: "Choose a smaller size if your heading is long.",
      options: {
        list: [
          { title: "Largest", value: "display-1" },
          { title: "Large (default)", value: "display-2" },
          { title: "Medium", value: "display-3" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "display-2",
    }),
  ],
  preview: {
    select: { title: "title", hidden: "hidden", media: "image" },
    prepare: ({ title, hidden, media }) => ({
      title: sectionTitle("Banner", title, hidden),
      subtitle: "Banner section",
      media: media ?? RocketIcon,
    }),
  },
});
