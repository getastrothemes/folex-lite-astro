import { ImageIcon } from "@sanity/icons/Image";
import { LinkIcon } from "@sanity/icons/Link";
import { defineArrayMember, defineField, defineType } from "sanity";
import { altField } from "../../lib/fields";
import { validateLinkUrl } from "../../lib/validation";

/** Rich text used for page bodies, project stories and content sections. */
export const portableText = defineType({
  name: "portableText",
  title: "Rich text",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading 2", value: "h2" },
        { title: "Heading 3", value: "h3" },
        { title: "Heading 4", value: "h4" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bullet list", value: "bullet" },
        { title: "Numbered list", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
        ],
        annotations: [
          defineArrayMember({
            name: "link",
            title: "Link",
            type: "object",
            icon: LinkIcon,
            fields: [
              defineField({
                name: "href",
                title: "Link",
                type: "string",
                description:
                  'A page path like "/contact/" (include the language for other languages, e.g. "/fr/contact/"), a full URL like "https://example.com", or a "mailto:" or "tel:" link.',
                validation: (rule) => [
                  rule.required().error("Add where the link goes."),
                  rule.custom(validateLinkUrl),
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
          }),
        ],
      },
    }),
    defineArrayMember({
      type: "image",
      title: "Image",
      icon: ImageIcon,
      options: { hotspot: true },
      fields: [
        altField(),
        defineField({
          name: "caption",
          title: "Caption",
          type: "string",
          description: "Optional text shown under the image.",
        }),
      ],
    }),
  ],
});
