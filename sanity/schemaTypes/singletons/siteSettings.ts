import { CogIcon } from "@sanity/icons/Cog";
import { defineArrayMember, defineField, defineType } from "sanity";
import { imageField } from "../../lib/fields";
import { validateEmail } from "../../lib/validation";

/** Global settings shared by every language: name, logos, contact info, SEO defaults. */
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "content", title: "General", default: true },
    { name: "branding", title: "Logo" },
    { name: "contact", title: "Contact & social" },
    { name: "seo", title: "SEO" },
    { name: "settings", title: "Settings" },
  ],
  fields: [
    // General
    defineField({
      name: "title",
      title: "Site name",
      type: "string",
      group: "content",
      description:
        'Your website or company name, e.g. "Acme Studio". Used as the browser tab title when a page has no title, in the logo\'s alternative text, and shown instead of the logo when no logo image or logo text is set.',
      validation: (rule) => rule.required().error("Add the site name."),
    }),
    defineField({
      name: "tagline",
      title: "Tagline",
      type: "string",
      group: "content",
      description:
        'Short phrase added after every page title in browser tabs and search results, e.g. "About us - Creative digital agency".',
      validation: (rule) =>
        rule
          .max(60)
          .warning("Keep the tagline short (60 characters or fewer)."),
    }),
    defineField({
      name: "description",
      title: "Site description",
      type: "text",
      rows: 3,
      group: "content",
      description:
        "Default description for search engines, used when a page has no meta description of its own.",
      validation: (rule) =>
        rule
          .max(160)
          .warning(
            "Search engines usually cut descriptions longer than 160 characters.",
          ),
    }),
    defineField({
      name: "notFound",
      title: "“Page not found” (404) page",
      type: "object",
      group: "content",
      description:
        "Shown when a visitor opens an address that doesn't exist. The same text is used for every language.",
      options: { collapsible: true, collapsed: true },
      fields: [
        defineField({
          name: "title",
          title: "Heading",
          type: "string",
          description:
            'e.g. "Page not found". Leave empty to use the theme\'s default text.',
        }),
        defineField({
          name: "description",
          title: "Text",
          type: "text",
          rows: 2,
          description:
            'e.g. "The page you are looking for might have been moved or deleted." Leave empty for the theme\'s default text.',
        }),
        defineField({
          name: "buttonLabel",
          title: "Button label",
          type: "string",
          description:
            'The button goes back to the home page, e.g. "Back to home". Leave empty to use the theme\'s default text.',
        }),
      ],
    }),

    // Logo
    imageField({
      name: "logo",
      title: "Logo (for light backgrounds)",
      group: "branding",
      description:
        "Dark logo for the header on white pages. SVG or transparent PNG works best.",
    }),
    imageField({
      name: "logoLight",
      title: "Logo (for dark backgrounds)",
      group: "branding",
      description:
        "Light logo for the header of pages that start with a Banner section (like the home page) and for the side panel. If empty, the dark logo is used there.",
    }),
    defineField({
      name: "logoText",
      title: "Logo text",
      type: "string",
      group: "branding",
      description:
        "Optional text shown next to the logo image, or on its own when no logo image is uploaded. When both are empty, the site name is shown.",
    }),
    defineField({
      name: "logoWidth",
      title: "Logo width (px)",
      type: "number",
      group: "branding",
      description:
        "Width of the logo in the header, in pixels, e.g. 86. The side panel uses its own size.",
      initialValue: 86,
      validation: (rule) =>
        rule
          .integer()
          .positive()
          .max(400)
          .error("Use a whole number from 1 to 400."),
    }),
    defineField({
      name: "logoHeight",
      title: "Logo height (px)",
      type: "number",
      group: "branding",
      description:
        "Height of the logo in the header, in pixels, e.g. 24. Keep the same proportions as your logo image.",
      initialValue: 24,
      validation: (rule) =>
        rule
          .integer()
          .positive()
          .max(200)
          .error("Use a whole number from 1 to 200."),
    }),

    // Contact & social
    defineField({
      name: "contactInfo",
      title: "Contact information",
      type: "object",
      group: "contact",
      description:
        "Shown at the bottom of the footer and in the side panel. Email and phone become clickable links.",
      fields: [
        defineField({
          name: "address",
          title: "Address",
          type: "text",
          rows: 3,
          description:
            "Press Enter for a new line; line breaks are kept on the website.",
        }),
        defineField({
          name: "email",
          title: "Email",
          type: "string",
          description: 'e.g. "hello@example.com".',
          validation: (rule) => rule.custom(validateEmail),
        }),
        defineField({
          name: "phone",
          title: "Phone",
          type: "string",
          description:
            'Written as you want it shown, e.g. "+1 (555) 123-4567".',
        }),
      ],
    }),
    defineField({
      name: "socialLinks",
      title: "Social media links",
      type: "array",
      group: "contact",
      description:
        "Icons linking to your social profiles, shown in the footer and the side panel. Drag to reorder.",
      of: [defineArrayMember({ type: "socialLink" })],
    }),
    defineField({
      name: "contactForm",
      title: "Contact form delivery",
      type: "object",
      group: "contact",
      description:
        "Where contact form messages are sent. The form's fields are edited per language in “Footer & contact form”.",
      fields: [
        defineField({
          name: "provider",
          title: "Form service",
          type: "string",
          description:
            "The service that emails you the form submissions. Netlify Forms only works when the website is hosted on Netlify.",
          options: {
            list: [
              { title: "FormSubmit (formsubmit.co)", value: "formsubmit.co" },
              { title: "Formspree", value: "formspree" },
              { title: "Netlify Forms", value: "netlify" },
            ],
            layout: "radio",
          },
          initialValue: "formsubmit.co",
        }),
        defineField({
          name: "action",
          title: "Form endpoint",
          type: "string",
          description:
            'The address the form is sent to, e.g. "https://formsubmit.co/your@email.com" or "https://formspree.io/f/abcdwxyz". For Netlify Forms use "/".',
          validation: (rule) =>
            rule.custom((value, context) => {
              const provider = (
                context.parent as { provider?: string } | undefined
              )?.provider;
              if (!value) return true;
              if (provider === "netlify")
                return value.startsWith("/")
                  ? true
                  : 'For Netlify Forms use "/".';
              return /^https:\/\/\S+$/.test(value)
                ? true
                : 'Use the full https:// address from your form service, e.g. "https://formspree.io/f/abcdwxyz".';
            }),
        }),
      ],
    }),

    // SEO
    defineField({
      name: "seo",
      title: "Default SEO",
      type: "defaultSeo",
      group: "seo",
      description:
        "Used on every page unless the page has its own SEO settings.",
    }),

    // Settings
    defineField({
      name: "stickyHeader",
      title: "Sticky header",
      type: "boolean",
      group: "settings",
      description:
        "On: the header stays at the top while scrolling. It hides when visitors scroll down and comes back when they scroll up. Off: the header scrolls away with the page. Pages that start with a Banner always use the On behavior.",
      initialValue: true,
    }),
    defineField({
      name: "showCopyright",
      title: "Show copyright",
      type: "boolean",
      group: "settings",
      description:
        "Show the copyright line in the footer. The text is edited per language in “Footer & contact form”.",
      initialValue: true,
    }),
  ],
  preview: {
    select: { title: "title", media: "logo" },
    prepare: ({ title, media }) => ({
      title: "Site settings",
      subtitle: title,
      media: media ?? CogIcon,
    }),
  },
});
