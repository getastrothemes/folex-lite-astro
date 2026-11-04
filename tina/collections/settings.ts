import type { Collection, TinaField } from "tinacms";
import { requiredText, validateUrl } from "../fields";
import { LANGUAGES, VISUAL_EDITING, languageFromDir, localeUrl } from "../site";

// Site-wide settings: `src/config/config.toml`, the navigation menus, social
// links and interface text (`src/i18n`). These files have no Markdown body.

const homeRouter = VISUAL_EDITING ? () => localeUrl(LANGUAGES[0].languageCode) : undefined;

const markdownHint = "Markdown links work, e.g. [hello@example.com](mailto:hello@example.com).";

const simpleButton = (name: string, label: string, description: string): TinaField => ({
  type: "object",
  name,
  label,
  description,
  fields: [
    { type: "boolean", name: "enable", label: "Show button" },
    {
      type: "string",
      name: "label",
      label: "Button text",
      description: 'Leave empty to use the text from "Interface text".',
    },
    { type: "string", name: "url", label: "Link", ui: { validate: validateUrl } },
  ],
});

export const siteSettingsCollection: Collection = {
  name: "siteSettings",
  label: "Settings · Site",
  path: "src/config",
  format: "toml",
  match: { include: "config" },
  ui: {
    allowedActions: { create: false, delete: false, createFolder: false },
    router: homeRouter,
  },
  fields: [
    {
      type: "object",
      name: "site",
      label: "Website",
      fields: [
        {
          type: "string",
          name: "title",
          label: "Website name",
          description: "Used in browser tabs, search results and social sharing.",
          ui: { validate: requiredText("Website name") },
        },
        {
          type: "string",
          name: "description",
          label: "Website description",
          description: "Default description for search engines and social sharing.",
          ui: { component: "textarea" },
        },
        {
          type: "string",
          name: "tagline",
          label: "Tagline",
          description: 'Added after page titles in the browser tab, e.g. "Home - Your tagline".',
        },
        {
          type: "string",
          name: "taglineSeparator",
          label: "Tagline separator",
          description: 'Text between the page title and the tagline. Leave empty for " - ".',
        },
        {
          type: "string",
          name: "baseUrl",
          label: "Website address",
          description: "Your live website address, e.g. https://www.example.com. Used for SEO and social sharing.",
          ui: {
            validate: (value?: string) =>
              !value || /^https?:\/\/[^/\s]+/.test(value)
                ? undefined
                : "Use a full address starting with https://",
          },
        },
        {
          type: "image",
          name: "logo",
          label: "Logo",
          description: "Shown in the header. SVG or PNG.",
        },
        {
          type: "image",
          name: "logoAlternate",
          label: "Logo on dark backgrounds",
          description: "A light version of your logo, shown on dark headers.",
        },
        {
          type: "string",
          name: "logoText",
          label: "Text next to the logo",
          description: "Optional.",
        },
        {
          type: "string",
          name: "logoWidth",
          label: "Logo width",
          description: 'With a unit, e.g. "86px".',
        },
        {
          type: "string",
          name: "logoHeight",
          label: "Logo height",
          description: 'With a unit, e.g. "24px".',
        },
        {
          type: "boolean",
          name: "trailingSlash",
          label: "End web addresses with a slash (advanced)",
          description: "Changes every URL. Leave as is unless you know you need it.",
        },
        {
          type: "object",
          name: "favicon",
          label: "Browser icon (favicon)",
          description:
            "After changing the image, a developer runs `npm run generate-favicons` to create the icon files.",
          fields: [
            { type: "string", name: "path", label: "Icon files folder (advanced)", ui: { component: "hidden" } },
            { type: "image", name: "image", label: "Icon source image" },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "seo",
      label: "Search engines (SEO)",
      fields: [
        { type: "string", name: "author", label: "Author" },
        {
          type: "string",
          name: "keywords",
          label: "Keywords",
          list: true,
          description: "Default keywords for every page.",
        },
        {
          type: "string",
          name: "robots",
          label: "Indexing rule",
          description: 'Use "index, follow" so search engines can find your site.',
        },
        {
          type: "object",
          name: "robotsTxt",
          label: "robots.txt",
          fields: [
            { type: "boolean", name: "enable", label: "Create robots.txt" },
            {
              type: "string",
              name: "disallow",
              label: "Paths hidden from search engines",
              list: true,
            },
          ],
        },
        {
          type: "object",
          name: "sitemap",
          label: "Sitemap",
          fields: [
            { type: "boolean", name: "enable", label: "Create a sitemap" },
            {
              type: "string",
              name: "exclude",
              label: "Folders left out of the sitemap",
              list: true,
            },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "settings",
      label: "Theme settings",
      fields: [
        {
          type: "string",
          name: "contactFormProvider",
          label: "Contact form service",
          description:
            "The service that delivers contact form messages to you. See the README section on the contact form.",
          options: [
            { value: "formsubmit.co", label: "FormSubmit" },
            { value: "formspree", label: "Formspree" },
            { value: "netlify", label: "Netlify Forms" },
          ],
        },
        {
          type: "string",
          name: "contactFormAction",
          label: "Contact form address",
          description:
            'FormSubmit: https://formsubmit.co/you@example.com · Formspree: https://formspree.io/f/your_form_id · Netlify: "/". The form does not deliver messages until this is set to your own address.',
          ui: { validate: validateUrl },
        },
        {
          type: "boolean",
          name: "stickyHeader",
          label: "Sticky header",
          description: "Hide the header when scrolling down and show it when scrolling up.",
        },
        {
          type: "object",
          name: "contactInfo",
          label: "Contact information",
          description: "Shown in the footer and the side menu.",
          fields: [
            {
              type: "string",
              name: "address",
              label: "Address",
              description: "Use <br /> for a line break.",
              ui: { component: "textarea" },
            },
            { type: "string", name: "email", label: "Email", description: markdownHint },
            {
              type: "string",
              name: "phone",
              label: "Phone",
              description: "e.g. [+1 800 123 456](tel:+1800123456)",
            },
          ],
        },
        simpleButton(
          "navigationButton",
          "Header button",
          "The call to action button in the header.",
        ),
        {
          type: "object",
          name: "headerOffcanvas",
          label: "Side menu",
          description: "The panel that opens from the menu icon in the header.",
          fields: [
            { type: "boolean", name: "enable", label: "Show the side menu" },
            { type: "image", name: "logo", label: "Logo", description: "Use a light logo, the panel is dark." },
            {
              type: "string",
              name: "description",
              label: "Text",
              description: 'Leave empty to use the text from "Interface text".',
              ui: { component: "textarea" },
            },
            simpleButton("button", "Button", ""),
          ],
        },
        {
          type: "string",
          name: "footerDescription",
          label: "Footer description",
          description: "Optional. Leave empty if unsure.",
        },
        {
          type: "object",
          name: "copyright",
          label: "Copyright",
          fields: [
            { type: "boolean", name: "enable", label: "Show copyright" },
            {
              type: "string",
              name: "text",
              label: "Copyright text",
              description:
                'Leave empty to use the translated text from "Interface text". {{ year }} becomes the current year.',
            },
          ],
        },
        {
          type: "object",
          name: "multilingual",
          label: "Languages (advanced)",
          description:
            "Changes the site structure. In local development, restart `npm run dev` after changing these.",
          fields: [
            { type: "boolean", name: "enable", label: "Use more than one language" },
            {
              type: "string",
              name: "defaultLanguage",
              label: "Main language code",
              description: 'e.g. "en". Must exist in src/config/language.json.',
            },
            {
              type: "string",
              name: "disableLanguages",
              label: "Turned off languages",
              list: true,
              description: 'Language codes to hide, e.g. "fr".',
            },
            {
              type: "boolean",
              name: "showDefaultLangInUrl",
              label: "Show the main language in web addresses",
              description: "e.g. /en/about/ instead of /about/.",
            },
          ],
        },
        // Folder names are part of the code structure: keep them, but hide them.
        { type: "string", name: "blogFolder", label: "Blog folder", ui: { component: "hidden" } },
        { type: "string", name: "servicesFolder", label: "Services folder", ui: { component: "hidden" } },
        { type: "string", name: "portfolioFolder", label: "Portfolio folder", ui: { component: "hidden" } },
      ],
    },
    {
      type: "object",
      name: "opengraph",
      label: "Social sharing",
      fields: [
        {
          type: "image",
          name: "image",
          label: "Default sharing image",
          description: "Used when a page has no image of its own. Ideally 1200 x 630 pixels.",
        },
        {
          type: "string",
          name: "twitter",
          label: "X (Twitter) handle",
          description: 'e.g. "@yourbrand".',
        },
        { type: "string", name: "ogLocale", label: "Locale (advanced)", description: 'e.g. "en_US".' },
        { type: "string", name: "ogType", label: "Content type (advanced)" },
        {
          type: "string",
          name: "twitterCard",
          label: "X card style (advanced)",
          options: [
            { value: "summary_large_image", label: "Large image" },
            { value: "summary", label: "Small image" },
          ],
        },
      ],
    },
    {
      type: "object",
      name: "head",
      label: "Custom code (advanced)",
      fields: [
        {
          type: "string",
          name: "content",
          label: "Code added to every page <head>",
          description:
            "For analytics or verification tags. Only paste code from a source you trust.",
          ui: { component: "textarea" },
        },
      ],
    },
  ],
};

// The menu supports three levels: top items, dropdown items and nested items.
const badgeField: TinaField = {
  type: "object",
  name: "badge",
  label: "Badge",
  description: 'Small label next to the item, e.g. "NEW".',
  fields: [
    { type: "boolean", name: "enable", label: "Show badge" },
    { type: "string", name: "label", label: "Badge text" },
    {
      type: "string",
      name: "color",
      label: "Color",
      options: ["primary", "accent", "info", "success", "danger"],
    },
    {
      type: "string",
      name: "type",
      label: "Style",
      options: [
        { value: "text", label: "Text" },
        { value: "dot", label: "Dot" },
      ],
    },
  ],
};

const menuItemFields = (children?: TinaField): TinaField[] => [
  { type: "boolean", name: "enable", label: "Show this item" },
  {
    type: "string",
    name: "name",
    label: "Text",
    ui: { validate: requiredText("Menu text") },
  },
  {
    type: "string",
    name: "url",
    label: "Link",
    description: "e.g. /about/ or https://example.com. Leave empty for an item that only opens a dropdown.",
    ui: { validate: validateUrl },
  },
  ...(children
    ? ([
        {
          type: "boolean",
          name: "hasChildren",
          label: "Has a dropdown",
          description: "Turn on to show the dropdown items below.",
        },
        children,
      ] as TinaField[])
    : []),
  badgeField,
  {
    type: "string",
    name: "target",
    label: "Open in (advanced)",
    options: [
      { value: "_self", label: "Same tab" },
      { value: "_blank", label: "New tab" },
    ],
  },
  { type: "string", name: "rel", label: "Link relationship (advanced)" },
];

const menuItemProps = {
  itemProps: (item: { name?: string; enable?: boolean }) => ({
    label: `${item?.name || "Menu item"}${item?.enable === false ? " (hidden)" : ""}`,
  }),
  defaultItem: () => ({ enable: true, name: "New item", url: "/" }),
};

const nestedItems: TinaField = {
  type: "object",
  name: "children",
  label: "Nested items",
  list: true,
  ui: menuItemProps,
  fields: menuItemFields(),
};

const dropdownItems: TinaField = {
  type: "object",
  name: "children",
  label: "Dropdown items",
  list: true,
  ui: menuItemProps,
  fields: menuItemFields(nestedItems),
};

export const menuCollection: Collection = {
  name: "menu",
  label: "Settings · Navigation menu",
  path: "src/config",
  format: "json",
  match: { include: `menu.{${LANGUAGES.map((lang) => lang.languageCode).join(",")}}` },
  ui: {
    allowedActions: { create: false, delete: false, createFolder: false },
  },
  fields: [
    {
      type: "object",
      name: "headerPrimary",
      label: "Header menu",
      description:
        "Drag to reorder. New pages are not added automatically: add a menu item that links to them.",
      list: true,
      ui: menuItemProps,
      fields: menuItemFields(dropdownItems),
    },
  ],
};

export const socialCollection: Collection = {
  name: "social",
  label: "Settings · Social links",
  path: "src/config",
  format: "json",
  match: { include: "social" },
  ui: {
    allowedActions: { create: false, delete: false, createFolder: false },
    router: homeRouter,
  },
  fields: [
    {
      type: "object",
      name: "main",
      label: "Social profiles",
      list: true,
      description: "Shown in the footer and the side menu.",
      ui: {
        itemProps: (item: { label?: string }) => ({ label: item?.label || "Social link" }),
        defaultItem: () => ({ enable: true, label: "", icon: "", url: "https://" }),
      },
      fields: [
        { type: "boolean", name: "enable", label: "Show this link" },
        {
          type: "string",
          name: "label",
          label: "Network name",
          description: 'e.g. "facebook". Used for screen readers.',
          ui: { validate: requiredText("Network name") },
        },
        {
          type: "image",
          name: "icon",
          label: "Icon (SVG)",
          description: "Must be an SVG file so it takes the theme colors.",
        },
        {
          type: "string",
          name: "url",
          label: "Profile address",
          ui: { validate: validateUrl },
        },
      ],
    },
  ],
};

export const translationsCollection: Collection = {
  name: "translations",
  label: "Settings · Interface text",
  path: "src/i18n",
  format: "json",
  match: { include: `{${LANGUAGES.map((lang) => lang.languageCode).join(",")}}` },
  ui: {
    allowedActions: { create: false, delete: false, createFolder: false },
    router: VISUAL_EDITING
      ? ({ document }) =>
          localeUrl(
            LANGUAGES.find((lang) => lang.languageCode === document._sys.filename)
              ?.languageCode ?? languageFromDir().languageCode,
          )
      : undefined,
  },
  fields: [
    {
      type: "object",
      name: "common",
      label: "Buttons and links",
      fields: [
        { type: "string", name: "viewDetails", label: '"View details" link' },
        { type: "string", name: "learnMoreAbout", label: '"Learn more about" link title' },
        { type: "string", name: "paginationPrevious", label: '"Previous" link' },
        { type: "string", name: "paginationNext", label: '"Next" link' },
        { type: "string", name: "paginationPortfolioPrev", label: '"Previous project" link' },
        { type: "string", name: "paginationPortfolioNext", label: '"Next project" link' },
      ],
    },
    {
      type: "object",
      name: "headerOffcanvas",
      label: "Side menu",
      fields: [
        { type: "string", name: "description", label: "Text", ui: { component: "textarea" } },
        { type: "string", name: "buttonLabel", label: "Button text" },
      ],
    },
    {
      type: "object",
      name: "navigation",
      label: "Header",
      fields: [{ type: "string", name: "buttonLabel", label: "Header button text" }],
    },
    {
      type: "object",
      name: "footer",
      label: "Footer",
      fields: [
        {
          type: "string",
          name: "copyright",
          label: "Copyright text",
          description:
            "{{ year }} becomes the current year. Keeping the theme credit is appreciated.",
        },
        { type: "string", name: "_comment", label: "Note", ui: { component: "hidden" } },
      ],
    },
  ],
};

export const settingsCollections = [
  siteSettingsCollection,
  menuCollection,
  socialCollection,
  translationsCollection,
];
