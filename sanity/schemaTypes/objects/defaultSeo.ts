import { SearchIcon } from "@sanity/icons/Search";
import { defineArrayMember, defineField, defineType } from "sanity";
import { imageField } from "../../lib/fields";

/** Site-wide SEO defaults, used by Site settings (field name `seo`). */
export const defaultSeo = defineType({
  name: "defaultSeo",
  title: "Default SEO",
  type: "object",
  icon: SearchIcon,
  fields: [
    defineField({
      name: "author",
      title: "Author",
      type: "string",
      description:
        'Name used in the "author" meta tag, e.g. your company name.',
    }),
    defineField({
      name: "keywords",
      title: "Keywords",
      type: "array",
      description:
        'Press Enter after each keyword, e.g. "design agency", "branding".',
      of: [defineArrayMember({ type: "string" })],
      options: { layout: "tags" },
    }),
    defineField({
      name: "robots",
      title: "Robots",
      type: "string",
      description:
        'Tells search engines what to do with your pages. Keep "index, follow" unless you know you need something else. Pages with "Hide from search engines" turned on always use "noindex, nofollow".',
      initialValue: "index, follow",
    }),
    imageField({
      name: "ogImage",
      title: "Default social sharing image",
      description:
        "Shown when a page without its own sharing or cover image is shared on social media, cropped to 1200 × 630 px.",
    }),
    defineField({
      name: "twitterHandle",
      title: "X (Twitter) handle",
      type: "string",
      description:
        'Your X account including the @, e.g. "@yourcompany". Added to the page info X uses when a link is shared.',
      validation: (rule) =>
        rule
          .custom((value) =>
            !value || value.startsWith("@")
              ? true
              : 'Start the handle with "@", e.g. "@yourcompany".',
          )
          .warning(),
    }),
  ],
});
