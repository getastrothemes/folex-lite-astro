import { LinkIcon } from "@sanity/icons/Link";
import { defineField, defineType } from "sanity";
import { validateLinkUrl } from "../../lib/validation";

/** A button or text link: label + URL, with an on/off switch. */
export const link = defineType({
  name: "link",
  title: "Button / link",
  type: "object",
  icon: LinkIcon,
  fields: [
    defineField({
      name: "enabled",
      title: "Show this button",
      type: "boolean",
      description:
        "Turn off to hide the button without losing its text and link.",
      initialValue: true,
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description:
        'Text on the button, e.g. "View our works" or "Get in touch".',
      validation: (rule) => [
        rule.custom((value, context) => {
          const parent = context.parent as { enabled?: boolean } | undefined;
          return parent?.enabled !== false && !value
            ? "Add a label, or turn off the button."
            : true;
        }),
        rule
          .max(40)
          .warning(
            "Short labels look best on buttons (40 characters or fewer).",
          ),
      ],
    }),
    defineField({
      name: "url",
      title: "Link",
      type: "string",
      description:
        'Where the button goes: a page path like "/contact/", a full URL like "https://example.com", "mailto:hello@example.com" or "tel:+123456789". Page paths get the language added automatically, so "/contact/" opens "/fr/contact/" on French pages.',
      validation: (rule) => [
        rule.custom(validateLinkUrl),
        rule.custom((value, context) => {
          const parent = context.parent as { enabled?: boolean } | undefined;
          return parent?.enabled !== false && !value
            ? "Add a link, or turn off the button."
            : true;
        }),
      ],
    }),
    defineField({
      name: "openInNewTab",
      title: "Open in a new tab",
      type: "boolean",
      description:
        "Full URLs to other websites (https://…) always open in a new tab. Turn this on to also open a page of your own site in a new tab.",
      initialValue: false,
    }),
  ],
  preview: {
    select: { label: "label", url: "url", enabled: "enabled" },
    prepare({ label, url, enabled }) {
      return {
        title: label || "Untitled button",
        subtitle: `${enabled === false ? "Hidden · " : ""}${url || "No link yet"}`,
      };
    },
  },
});
