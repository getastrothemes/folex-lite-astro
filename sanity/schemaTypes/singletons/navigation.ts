import { MenuIcon } from "@sanity/icons/Menu";
import { defineArrayMember, defineField, defineType } from "sanity";
import { languageField } from "../../lib/fields";
import { languageTitle } from "../../lib/languages";

/** Header menu, header button and side panel for one language. */
export const navigation = defineType({
  name: "navigation",
  title: "Navigation menu",
  type: "document",
  icon: MenuIcon,
  groups: [
    { name: "content", title: "Menu", default: true },
    { name: "header", title: "Header button & side panel" },
    { name: "settings", title: "Settings" },
  ],
  fields: [
    defineField({
      name: "menu",
      title: "Menu items",
      type: "array",
      group: "content",
      description:
        "Links in the header menu, left to right. Add dropdown links inside an item. Drag to reorder.",
      of: [defineArrayMember({ type: "menuItem" })],
    }),
    defineField({
      name: "headerButton",
      title: "Header button",
      type: "link",
      group: "header",
      description:
        'Highlighted button at the right of the header, e.g. "Let\'s talk" → "/contact/".',
    }),
    defineField({
      name: "sidePanel",
      title: "Side panel",
      type: "object",
      group: "header",
      description:
        "Panel that slides in from the side with your contact info and a short text.",
      fields: [
        defineField({
          name: "enabled",
          title: "Show the side panel",
          type: "boolean",
          initialValue: true,
        }),
        defineField({
          name: "description",
          title: "Text",
          type: "text",
          rows: 3,
          description: "A short introduction shown in the panel.",
        }),
        defineField({
          name: "button",
          title: "Button",
          type: "link",
        }),
      ],
    }),
    languageField({ readOnly: true, group: "settings" }),
  ],
  preview: {
    select: { language: "language", menu: "menu" },
    prepare: ({ language, menu }) => ({
      title: `Navigation menu (${languageTitle(language)})`,
      subtitle: `${menu?.length ?? 0} menu items`,
      media: MenuIcon,
    }),
  },
});
