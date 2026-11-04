import { LinkIcon } from "@sanity/icons/Link";
import { defineArrayMember, defineField, defineType } from "sanity";
import {
  menuBadgeField,
  menuLabelField,
  menuSubtitle,
  menuUrlField,
} from "./menuFields";

/** Second menu level: a link in a dropdown, optionally with its own submenu. */
export const menuChild = defineType({
  name: "menuChild",
  title: "Submenu link",
  type: "object",
  icon: LinkIcon,
  fields: [
    menuLabelField(),
    menuUrlField(
      'Where the link goes, e.g. "/services/". Leave empty when this item only opens its own submenu below.',
    ),
    menuBadgeField(),
    defineField({
      name: "children",
      title: "Submenu",
      type: "array",
      description: "Optional links shown in a nested dropdown under this item.",
      of: [defineArrayMember({ type: "menuGrandchild" })],
    }),
  ],
  preview: {
    select: {
      title: "label",
      url: "url",
      children: "children",
      badge: "badge.label",
    },
    prepare: ({ title, url, children, badge }) => ({
      title: title || "Untitled link",
      subtitle: menuSubtitle(url, children, badge),
    }),
  },
});
