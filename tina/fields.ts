import type { TinaField } from "tinacms";

// Shared field builders for the Tina schema. Every field name matches the
// existing frontmatter keys, so Tina and the Astro content collections read
// and write the same files.

type Field = TinaField;

/** Accepts site paths, page anchors, full web addresses, email and phone links. */
export const validateUrl = (value?: string) => {
  if (!value) return;
  if (/^(\/|#|https?:\/\/|mailto:|tel:)/.test(value.trim())) return;
  return "Start with / for a page on this site (e.g. /contact/), or a full address like https://example.com, mailto: or tel:.";
};

export const requiredText = (label: string) => (value?: string) =>
  value && value.trim() ? undefined : `${label} is required.`;

export const enableField = (description: string): Field => ({
  type: "boolean",
  name: "enable",
  label: "Show on the website",
  description,
});

export const buttonField = ({
  name = "button",
  label = "Button",
  description = "",
}: { name?: string; label?: string; description?: string } = {}): Field => ({
  type: "object",
  name,
  label,
  description,
  fields: [
    {
      type: "boolean",
      name: "enable",
      label: "Show button",
    },
    {
      type: "string",
      name: "label",
      label: "Button text",
      description: 'Short action text, e.g. "Get Started".',
    },
    {
      type: "string",
      name: "url",
      label: "Link",
      description:
        "Where the button goes. Use /contact/ for a page on this site or a full address for another site.",
      ui: { validate: validateUrl },
    },
    {
      type: "string",
      name: "variant",
      label: "Style",
      options: [
        { value: "fill", label: "Filled" },
        { value: "outline", label: "Outline" },
        { value: "text", label: "Text only" },
        { value: "circle", label: "Circle" },
      ],
    },
    {
      type: "string",
      name: "hoverEffect",
      label: "Hover effect",
      description:
        "Creative fill works in this theme. The other effects are part of the Pro version.",
      options: [
        { value: "creative-fill", label: "Creative fill" },
        { value: "text-flip", label: "Text flip (Pro)" },
        { value: "magnetic", label: "Magnetic (Pro)" },
        { value: "magnetic-text-flip", label: "Magnetic text flip (Pro)" },
      ],
    },
    {
      type: "string",
      name: "target",
      label: "Open in",
      description: "Links to other websites open in a new tab automatically.",
      options: [
        { value: "_self", label: "Same tab" },
        { value: "_blank", label: "New tab" },
      ],
    },
    {
      type: "string",
      name: "rel",
      label: "Link relationship (advanced)",
      description: 'Optional, e.g. "nofollow". Leave empty if unsure.',
    },
    {
      type: "string",
      name: "icon",
      label: "Icon path (advanced)",
      description: "Optional SVG icon path. Leave empty for the default arrow.",
    },
    {
      type: "string",
      name: "class",
      label: "Extra CSS classes (advanced)",
      description: "For developers. Leave empty if unsure.",
    },
    {
      type: "string",
      name: "tag",
      label: "HTML element (advanced)",
      options: [
        { value: "a", label: "Link (a)" },
        { value: "button", label: "Button (button)" },
      ],
    },
  ],
});

/** Search engine and social sharing fields shared by pages and portfolio items. */
export const seoFields = ({
  withDraft = true,
  withImage = true,
} = {}): Field[] => [
  {
    type: "string",
    name: "metaTitle",
    label: "SEO title",
    description:
      "Title shown in search results and browser tabs. Leave empty to use the page title.",
  },
  {
    type: "string",
    name: "metaDescription",
    label: "SEO description",
    description:
      "One or two sentences shown under the title in search results (about 150 characters).",
    ui: { component: "textarea" },
  },
  ...(withImage
    ? ([
        {
          type: "image",
          name: "image",
          label: "Featured / social sharing image",
          description:
            "Shown at the top of the page and when it is shared on social media. Use a wide image, ideally 1200 x 630 pixels.",
        },
      ] as Field[])
    : []),
  {
    type: "string",
    name: "keywords",
    label: "SEO keywords",
    list: true,
    description: "Optional. Leave empty to use the keywords from Site settings.",
  },
  {
    type: "string",
    name: "canonical",
    label: "Canonical URL (advanced)",
    description:
      "Only needed when the same content also exists at another address.",
    ui: { validate: validateUrl },
  },
  {
    type: "string",
    name: "robots",
    label: "Search engine indexing (advanced)",
    description: 'Leave empty to use Site settings. Use "noindex, nofollow" to hide this page from search engines.',
  },
  {
    type: "boolean",
    name: "excludeFromSitemap",
    label: "Hide from sitemap",
  },
  {
    type: "boolean",
    name: "disableTagline",
    label: "Hide site tagline in the browser title",
  },
  ...(withDraft
    ? ([
        {
          type: "boolean",
          name: "draft",
          label: "Draft (hidden from the live website)",
          description:
            "Drafts are visible while editing locally but are not published.",
        },
      ] as Field[])
    : []),
];

export const slugField: Field = {
  type: "string",
  name: "customSlug",
  label: "Custom URL slug",
  description:
    'Optional. Changes the web address, e.g. "my-project" gives /portfolio/my-project/. Use lowercase letters, numbers and dashes. Keep the same slug in every language.',
  ui: {
    validate: (value?: string) =>
      !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
        ? undefined
        : "Use lowercase letters, numbers and dashes only, e.g. my-page.",
  },
};

export const weightField: Field = {
  type: "number",
  name: "weight",
  label: "Display order",
  description: "Lower numbers are shown first. Leave empty to sort by file name.",
};

export const dateField: Field = {
  type: "datetime",
  name: "date",
  label: "Date",
  ui: { dateFormat: "YYYY-MM-DD" },
};

export const bodyField = (description: string): Field => ({
  type: "rich-text",
  name: "body",
  label: "Content",
  isBody: true,
  description,
});

/** Turns a title into a safe file name. */
export const slugify = (value = "") =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "untitled";
