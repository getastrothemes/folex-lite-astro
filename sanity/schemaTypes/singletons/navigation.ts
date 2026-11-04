import { MenuIcon } from "@sanity/icons/Menu";
import { defineArrayMember, defineField, defineType } from "sanity";
import { languageField } from "../../lib/fields";
import { languageTitle } from "../../lib/languages";
import { arrayLength, countLabel } from "../../lib/preview";

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
        'Highlighted button at the right of the header on large screens (at the end of the menu on phones and tablets), e.g. "Let\'s talk" → "/contact/".',
    }),
    defineField({
      name: "sidePanel",
      title: "Side panel",
      type: "object",
      group: "header",
      description:
        "Panel that slides in from the right when visitors click the menu (☰) button in the header. It shows the light logo, a short text, your contact info and social links from Site settings, and a button. On phones and tablets it also holds the main menu.",
      fields: [
        defineField({
          name: "enabled",
          title: "Show the side panel",
          type: "boolean",
          description:
            "Keep this on: on phones and tablets the main menu is only reachable through the side panel.",
          initialValue: true,
          validation: (rule) =>
            rule
              .custom((enabled) =>
                enabled === false
                  ? "With the side panel off, visitors on phones and tablets can't open the menu."
                  : true,
              )
              .warning(),
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
          description:
            "Shown at the bottom of the panel on large screens only.",
        }),
      ],
    }),
    languageField({ readOnly: true, group: "settings" }),
  ],
  preview: {
    select: { language: "language", menu: "menu" },
    prepare: ({ language, menu }) => ({
      title: `Navigation menu (${languageTitle(language)})`,
      subtitle: countLabel(arrayLength(menu), "menu item"),
      media: MenuIcon,
    }),
  },
});
