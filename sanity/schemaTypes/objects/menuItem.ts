import { MenuIcon } from "@sanity/icons/Menu";
import { defineArrayMember, defineField, defineType } from "sanity";
import {
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
      'Where the link goes, e.g. "/" or "/contact/". Leave empty when this item only opens a dropdown.',
    ),
    menuBadgeField(),
    defineField({
      name: "children",
      title: "Dropdown links",
      type: "array",
      description:
        "Optional. Add links here to turn this item into a dropdown menu.",
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
