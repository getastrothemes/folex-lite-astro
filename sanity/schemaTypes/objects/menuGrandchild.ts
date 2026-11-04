import { LinkIcon } from "@sanity/icons/Link";
import { defineType } from "sanity";
import {
  MENU_URL_HELP,
  menuBadgeField,
  menuLabelField,
  menuSubtitle,
  menuUrlField,
} from "./menuFields";

/** Third menu level (a link inside a submenu of a submenu). */
export const menuGrandchild = defineType({
  name: "menuGrandchild",
  title: "Menu link",
  type: "object",
  icon: LinkIcon,
  fields: [
    menuLabelField(),
    menuUrlField(
      `Where the link goes, e.g. "/about/" or "https://example.com". ${MENU_URL_HELP}`,
    ),
    menuBadgeField(),
  ],
  preview: {
    select: { title: "label", url: "url", badge: "badge.label" },
    prepare: ({ title, url, badge }) => ({
      title: title || "Untitled link",
      subtitle: menuSubtitle(url, [], badge),
    }),
  },
});
