import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { defineArrayMember, defineField, defineType } from "sanity";
import { languageField } from "../../lib/fields";
import { languageTitle } from "../../lib/languages";

/** Footer call-to-action, copyright and contact form for one language. */
export const footer = defineType({
  name: "footer",
  title: "Footer & contact form",
  type: "document",
  icon: EnvelopeIcon,
  groups: [
    { name: "content", title: "Footer", default: true },
    { name: "form", title: "Contact form" },
    { name: "settings", title: "Settings" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Big heading",
      type: "string",
      group: "content",
      description:
        'Large call-to-action heading at the top of the footer, e.g. "Let\'s work together". Use **double asterisks** for bold text.',
    }),
    defineField({
      name: "description",
      title: "Text",
      type: "text",
      rows: 3,
      group: "content",
      description:
        "A short sentence under the heading. You can use **bold text** and links like [Contact us](/contact/) (in other languages include the language, e.g. /fr/contact/).",
    }),
    defineField({
      name: "copyright",
      title: "Copyright line",
      type: "string",
      group: "content",
      description:
        'Use {{ year }} for the current year and [Name](https://example.com) for a link. A " / " splits the line into separate parts, e.g. "© {{ year }} Your Company / Made with [Astro](https://astro.build)". Any other slash outside a full https:// link splits it too, so use full URLs in links. Turn the line off in Site settings → Settings.',
    }),
    defineField({
      name: "contactForm",
      title: "Contact form",
      type: "object",
      group: "form",
      description:
        "Fields and messages of the footer contact form. The delivery service is set in Site settings.",
      fields: [
        defineField({
          name: "emailSubject",
          title: "Email subject",
          type: "string",
          description:
            'Subject of the email you receive, e.g. "New message from the website".',
        }),
        defineField({
          name: "fields",
          title: "Form fields",
          type: "array",
          description:
            "The inputs visitors fill in, top to bottom. Drag to reorder. Fields set to half width sit side by side.",
          of: [defineArrayMember({ type: "formField" })],
          validation: (rule) =>
            rule.custom((fields: Array<{ name?: string }> | undefined) => {
              const names = (fields ?? [])
                .map((field) => field.name)
                .filter(Boolean);
              const duplicate = names.find(
                (name, index) => names.indexOf(name) !== index,
              );
              return duplicate
                ? `Two fields use the name "${duplicate}". Each field needs its own name.`
                : true;
            }),
        }),
        defineField({
          name: "note",
          title: "Note",
          type: "text",
          rows: 2,
          description:
            "Optional small text under the send button. You can use **bold** and links like [privacy policy](/privacy-policy/) (in other languages include the language, e.g. /fr/privacy-policy/).",
        }),
        defineField({
          name: "submitLabel",
          title: "Send button label",
          type: "string",
          description: 'Text on the send button, e.g. "Send message".',
        }),
        defineField({
          name: "successMessage",
          title: "Success message",
          type: "text",
          rows: 2,
          description:
            'Shown after the form was sent, e.g. "Thanks! We will get back to you soon."',
        }),
        defineField({
          name: "errorMessage",
          title: "Error message",
          type: "text",
          rows: 2,
          description:
            'Shown when sending fails, e.g. "Something went wrong. Please try again."',
        }),
      ],
    }),
    languageField({ readOnly: true, group: "settings" }),
  ],
  preview: {
    select: { language: "language", title: "title" },
    prepare: ({ language, title }) => ({
      title: `Footer & contact form (${languageTitle(language)})`,
      subtitle: title,
      media: EnvelopeIcon,
    }),
  },
});
