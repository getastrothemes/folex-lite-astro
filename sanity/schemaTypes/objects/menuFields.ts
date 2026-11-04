/**
 * Shared fields for the three menu levels (menuItem, menuChild, menuGrandchild).
 * Not a schema type itself.
 */
import { defineField } from "sanity";
import { validateLinkUrl } from "../../lib/validation";

export function menuLabelField() {
  return defineField({
    name: "label",
    title: "Label",
    type: "string",
    description: 'Text shown in the menu, e.g. "About us".',
    validation: (rule) => [
      rule.required().error("Add the text shown in the menu."),
      rule
        .max(40)
        .warning(
          "Short menu labels are easier to read (40 characters or fewer).",
        ),
    ],
  });
}

export function menuUrlField(description: string) {
  return defineField({
    name: "url",
    title: "Link",
    type: "string",
    description,
    validation: (rule) => rule.custom(validateLinkUrl),
  });
}

/** Explains how menu links are written; appended to every menu link description. */
export const MENU_URL_HELP =
  'Page paths get the language added automatically ("/about/" opens "/fr/about/" in the French menu). Full URLs (https://…) open in a new tab.';

export function menuBadgeField(description?: string) {
  return defineField({
    name: "badge",
    title: "Badge",
    type: "menuBadge",
    // Only override the menuBadge type's own description when one is given
    ...(description ? { description } : {}),
  });
}

/** Preview subtitle: the link, or how many sub-items the entry has. */
export function menuSubtitle(
  url?: string,
  children?: unknown[],
  badge?: string,
): string {
  const parts = [] as string[];
  if (Array.isArray(children) && children.length)
    parts.push(
      `Dropdown · ${children.length} link${children.length === 1 ? "" : "s"}`,
    );
  else parts.push(url || "No link");
  if (badge) parts.push(`Badge: ${badge}`);
  return parts.join(" · ");
}
