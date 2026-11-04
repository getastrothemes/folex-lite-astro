import type { Collection, TinaField } from "tinacms";
import { buttonField, enableField, requiredText } from "../fields";
import { LANGUAGES, VISUAL_EDITING, docLanguage, localeUrl } from "../site";

// Shared section content (`src/content/sections/{language}/{file}.md`).
// Each section type is one collection with one document per language. The
// files already exist, so creating or deleting them from the CMS is disabled.

const sectionCollection = ({
  name,
  label,
  file,
  fields,
}: {
  name: string;
  label: string;
  file: string;
  fields: TinaField[];
}): Collection => ({
  name,
  label: `Section · ${label}`,
  path: "src/content/sections",
  format: "md",
  match: {
    include: `{${LANGUAGES.map((lang) => lang.contentDir).join(",")}}/${file}`,
  },
  ui: {
    allowedActions: { create: false, delete: false, createFolder: false },
    // Sections are previewed on the homepage of their language.
    router: VISUAL_EDITING
      ? ({ document }) => localeUrl(docLanguage(document).languageCode)
      : undefined,
  },
  fields,
});

const sectionTitle = (description = "Leave empty to hide the heading."): TinaField => ({
  type: "string",
  name: "title",
  label: "Heading",
  description: `${description} You can use <br /> for a line break.`,
});

const appearanceField = (
  options = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
  ],
): TinaField => ({
  type: "string",
  name: "appearance",
  label: "Color style",
  options,
});

const limitField: TinaField = {
  type: "number",
  name: "limit",
  label: "Number of items to show",
  description: "Leave empty to show all of them.",
};

export const bannerCollection = sectionCollection({
  name: "banner",
  label: "Hero banner",
  file: "banner",
  fields: [
    enableField("Turn off to hide the hero banner on every page that uses it."),
    sectionTitle("The large headline at the top of the homepage."),
    {
      type: "string",
      name: "titleSize",
      label: "Heading size",
      description: "Pick a smaller size if the headline is long.",
      options: [
        { value: "display-1", label: "Extra large" },
        { value: "display-2", label: "Large" },
        { value: "display-3", label: "Medium" },
      ],
    },
    {
      type: "string",
      name: "description",
      label: "Text below the heading",
      ui: { component: "textarea" },
    },
    {
      type: "image",
      name: "image",
      label: "Image",
      description: "Large image below the text. A wide image works best (around 1700 x 1080 pixels).",
    },
    buttonField(),
  ],
});

export const clientsCollection = sectionCollection({
  name: "clients",
  label: "Client logos",
  file: "clients",
  fields: [
    enableField("Turn off to hide the client logos."),
    sectionTitle(),
    {
      type: "object",
      name: "list",
      label: "Logos",
      list: true,
      ui: {
        itemProps: (item: { alt?: string }) => ({ label: item?.alt || "Logo" }),
        defaultItem: () => ({ alt: "Client logo", src: "" }),
      },
      fields: [
        {
          type: "image",
          name: "src",
          label: "Logo image",
          description: "SVG or PNG with a transparent background works best.",
        },
        {
          type: "string",
          name: "alt",
          label: "Logo description",
          description: 'For screen readers and search engines, e.g. "Acme Inc. logo".',
          ui: { validate: requiredText("Logo description") },
        },
      ],
    },
    {
      type: "object",
      name: "options",
      label: "Layout",
      fields: [
        appearanceField(),
        {
          type: "number",
          name: "columnsPerRow",
          label: "Logos per row",
          description: "4 or 6.",
          ui: {
            validate: (value?: number) =>
              value == null || value === 4 || value === 6
                ? undefined
                : "Use 4 or 6.",
          },
        },
      ],
    },
  ],
});

export const servicesSectionCollection = sectionCollection({
  name: "servicesSection",
  label: "Services",
  file: "services-section",
  fields: [
    enableField("Turn off to hide the services list."),
    sectionTitle(),
    {
      type: "string",
      name: "sectionDirection",
      label: "Heading position",
      options: [
        { value: "vertical", label: "Above the list" },
        { value: "horizontal", label: "Next to the list" },
      ],
    },
    {
      type: "object",
      name: "options",
      label: "Layout",
      description: 'The services themselves are edited under "Services" in the menu.',
      fields: [
        {
          type: "string",
          name: "layout",
          label: "Layout",
          options: [
            { value: "accordion", label: "Accordion" },
            { value: "grid", label: "Grid (Pro version only)" },
          ],
        },
        limitField,
        {
          type: "number",
          name: "column",
          label: "Columns (grid layout)",
          description: "1, 2 or 3.",
          ui: {
            validate: (value?: number) =>
              value == null || [1, 2, 3].includes(value)
                ? undefined
                : "Use 1, 2 or 3.",
          },
        },
        {
          type: "string",
          name: "iconPlacement",
          label: "Icon position (grid layout)",
          options: [
            { value: "top", label: "Top" },
            { value: "right", label: "Right" },
          ],
        },
        appearanceField(),
      ],
    },
  ],
});

export const portfolioSectionCollection = sectionCollection({
  name: "portfolioSection",
  label: "Portfolio",
  file: "portfolio-section",
  fields: [
    enableField("Turn off to hide the portfolio grid."),
    sectionTitle(),
    {
      type: "object",
      name: "options",
      label: "Layout",
      description: 'The projects themselves are edited under "Portfolio" in the menu.',
      fields: [
        {
          type: "string",
          name: "layout",
          label: "Layout",
          options: [
            { value: "grid", label: "Grid" },
            { value: "masonry", label: "Masonry" },
            { value: "slider", label: "Slider (Pro version only)" },
            { value: "full-width", label: "Full width (Pro version only)" },
          ],
        },
        appearanceField(),
        limitField,
      ],
    },
    buttonField({
      description: "Optional link below the projects, e.g. to a full portfolio page.",
    }),
  ],
});

export const pricingSectionCollection = sectionCollection({
  name: "pricingSection",
  label: "Pricing plans",
  file: "pricing-section",
  fields: [
    enableField("Turn off to hide the pricing plans."),
    sectionTitle(),
    {
      type: "object",
      name: "list",
      label: "Plans",
      list: true,
      ui: {
        itemProps: (item: { name?: string }) => ({ label: item?.name || "Plan" }),
        defaultItem: () => ({
          enable: true,
          name: "New plan",
          description: "",
          price: { prependValue: "$", value: "0", appendValue: "/mo" },
          features: [],
          button: { enable: true, label: "Choose this plan", url: "/" },
        }),
      },
      fields: [
        { type: "boolean", name: "enable", label: "Show this plan" },
        {
          type: "string",
          name: "name",
          label: "Plan name",
          ui: { validate: requiredText("Plan name") },
        },
        {
          type: "string",
          name: "description",
          label: "Description",
          ui: { component: "textarea" },
        },
        {
          type: "object",
          name: "price",
          label: "Price",
          fields: [
            {
              type: "string",
              name: "prependValue",
              label: "Before the price",
              description: 'Currency symbol, e.g. "$".',
            },
            {
              type: "string",
              name: "value",
              label: "Amount",
              description: 'e.g. "49".',
            },
            {
              type: "string",
              name: "appendValue",
              label: "After the price",
              description: 'Billing period, e.g. "/mo".',
            },
          ],
        },
        {
          type: "string",
          name: "features",
          label: "Features",
          list: true,
        },
        buttonField(),
      ],
    },
  ],
});

export const callToActionCollection = sectionCollection({
  name: "callToAction",
  label: "Footer call to action",
  file: "call-to-action",
  fields: [
    enableField("Controls the call to action block where a page uses it."),
    sectionTitle("Large heading in the footer, next to the contact form."),
    {
      type: "string",
      name: "description",
      label: "Text",
      description: "Shown below the footer heading. Markdown is allowed.",
      ui: { component: "textarea" },
    },
    buttonField(),
    {
      type: "object",
      name: "options",
      label: "Layout",
      fields: [
        appearanceField([
          { value: "light", label: "Light" },
          { value: "accent", label: "Accent" },
        ]),
        {
          type: "boolean",
          name: "centeredContent",
          label: "Center the content",
        },
      ],
    },
  ],
});

const inputBaseFields: TinaField[] = [
  {
    type: "string",
    name: "name",
    label: "Field name in submissions",
    description:
      'The name you see in the emails you receive, e.g. "Full Name". Required for every input.',
  },
  { type: "string", name: "label", label: "Label" },
  { type: "string", name: "placeholder", label: "Placeholder text" },
  { type: "boolean", name: "required", label: "Required" },
  { type: "boolean", name: "halfWidth", label: "Half width" },
  { type: "string", name: "defaultValue", label: "Default value" },
];

export const contactSectionCollection = sectionCollection({
  name: "contactSection",
  label: "Footer contact form",
  file: "contact-section",
  fields: [
    {
      type: "object",
      name: "form",
      label: "Contact form",
      description:
        'Where messages are sent is set in Site settings → "Contact form".',
      fields: [
        {
          type: "string",
          name: "emailSubject",
          label: "Email subject",
          description: "Subject of the email you receive for each message.",
        },
        {
          type: "object",
          name: "submitButton",
          label: "Send button",
          fields: [
            { type: "boolean", name: "enable", label: "Show button" },
            { type: "string", name: "label", label: "Button text" },
          ],
        },
        {
          type: "string",
          name: "note",
          label: "Note below the form",
          description: "Optional. Markdown is allowed, e.g. a link to your privacy policy.",
          ui: { component: "textarea" },
        },
        {
          type: "object",
          name: "inputs",
          label: "Form fields",
          list: true,
          description:
            "Drag to reorder. Radio buttons with the same group are shown together.",
          ui: {
            itemProps: (item: {
              name?: string;
              placeholder?: string;
              label?: string;
              note?: string;
              content?: string;
            }) => ({
              label:
                (item?.note ? `Message: ${item.content ?? item.note}` : "") ||
                item?.name ||
                item?.placeholder ||
                item?.label ||
                "Form field",
            }),
            defaultItem: () => ({
              name: "New field",
              placeholder: "New field",
              required: false,
              halfWidth: false,
            }),
          },
          fields: [
            ...inputBaseFields,
            {
              type: "string",
              name: "type",
              label: "Input type",
              description: "Leave empty for a normal text field.",
              options: [
                { value: "text", label: "Text" },
                { value: "email", label: "Email" },
                { value: "radio", label: "Radio button" },
                { value: "checkbox", label: "Checkbox" },
              ],
            },
            {
              type: "string",
              name: "tag",
              label: "Multi-line text area",
              description: 'Choose "textarea" for a message box.',
              options: [{ value: "textarea", label: "textarea" }],
            },
            {
              type: "string",
              name: "rows",
              label: "Text area rows",
              description: 'Height of a message box, e.g. "4".',
            },
            {
              type: "boolean",
              name: "checked",
              label: "Checked by default (radio / checkbox)",
            },
            {
              type: "string",
              name: "value",
              label: "Submitted value (radio / checkbox)",
            },
            {
              type: "string",
              name: "id",
              label: "HTML id (advanced)",
            },
            {
              type: "string",
              name: "group",
              label: "Radio group (advanced)",
              description: "Radio buttons with the same group work together.",
            },
            {
              type: "string",
              name: "groupLabel",
              label: "Group label",
              description: "Question shown above a radio group.",
            },
            {
              type: "object",
              name: "dropdown",
              label: "Dropdown options",
              description: "Add options to turn this field into a dropdown.",
              fields: [
                {
                  type: "string",
                  name: "type",
                  label: "Dropdown type",
                  options: [
                    { value: "select", label: "Simple" },
                    { value: "search", label: "With search" },
                  ],
                },
                {
                  type: "object",
                  name: "search",
                  label: "Search box",
                  fields: [
                    {
                      type: "string",
                      name: "placeholder",
                      label: "Search placeholder",
                    },
                  ],
                },
                {
                  type: "object",
                  name: "items",
                  label: "Options",
                  list: true,
                  ui: {
                    itemProps: (item: { label?: string }) => ({
                      label: item?.label || "Option",
                    }),
                  },
                  fields: [
                    { type: "string", name: "label", label: "Label" },
                    { type: "string", name: "value", label: "Value" },
                    {
                      type: "boolean",
                      name: "selected",
                      label: "Selected by default",
                    },
                  ],
                },
              ],
            },
            {
              type: "string",
              name: "note",
              label: "Status message type (advanced)",
              description:
                "Only for the success and error messages shown after sending.",
              options: ["info", "warning", "success", "deprecated", "hint"],
            },
            {
              type: "string",
              name: "content",
              label: "Status message text",
            },
            {
              type: "string",
              name: "parentClass",
              label: "Wrapper CSS classes (advanced)",
              description:
                'Keep "hidden text-sm message success" / "hidden text-sm message error" on the status messages.',
            },
          ],
        },
      ],
    },
  ],
});

export const sectionCollections = [
  bannerCollection,
  clientsCollection,
  servicesSectionCollection,
  portfolioSectionCollection,
  pricingSectionCollection,
  callToActionCollection,
  contactSectionCollection,
];
