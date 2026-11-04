import { MenuIcon } from "@sanity/icons/Menu";
import { defineArrayMember, defineField, defineType } from "sanity";
import {
  MENU_URL_HELP,
  menuBadgeField,
  menuLabelField,
  menuSubtitle,
  menuUrlField,
} from "./menuFields";

/** Top-level link in the header menu, optionally with a dropdown. */
export const menuItem = defineType({
  name: "menuItem",
  title: "Menu item",
  type: "object",
  icon: MenuIcon,
  fields: [
    menuLabelField(),
    menuUrlField(
      `Where the link goes, e.g. "/" or "/contact/". Not used when the item has dropdown links (it then only opens the dropdown). ${MENU_URL_HELP}`,
    ),
    menuBadgeField(
      "Optional. Leave the text empty for no badge. Badges are not shown on items with dropdown links.",
    ),
    defineField({
      name: "children",
      title: "Dropdown links",
      type: "array",
      description:
        "Optional. Add links here to turn this item into a dropdown menu. The item itself then only opens the dropdown.",
      of: [defineArrayMember({ type: "menuChild" })],
    }),
  ],
  validation: (rule) =>
    rule.custom((value: { url?: string; children?: unknown[] } | undefined) =>
      value && !value.url && !value.children?.length
        ? "Add a link or at least one dropdown link."
        : true,
    ),
  preview: {
    select: {
      title: "label",
      url: "url",
      children: "children",
      badge: "badge.label",
    },
    prepare: ({ title, url, children, badge }) => ({
      title: title || "Untitled menu item",
      subtitle: menuSubtitle(url, children, badge),
    }),
  },
});
