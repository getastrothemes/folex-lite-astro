import { LinkIcon } from "@sanity/icons/Link";
import { defineArrayMember, defineField, defineType } from "sanity";
import {
  MENU_URL_HELP,
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
      `Where the link goes, e.g. "/services/". Not used when this link has its own submenu (it then only opens the submenu). ${MENU_URL_HELP}`,
    ),
    menuBadgeField(
      "Optional. Leave the text empty for no badge. Badges are not shown on links with a submenu.",
    ),
    defineField({
      name: "children",
      title: "Submenu",
      type: "array",
      description:
        "Optional. Links shown in a nested dropdown that opens beside this link.",
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
