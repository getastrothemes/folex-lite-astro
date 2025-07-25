import { z } from "zod";

export const sharedButton = z
  .object({
    enable: z.boolean().optional(),
    tag: z.enum(["a", "button"]).optional(),
    url: z.string().optional(),
    label: z.string(),
    class: z.string().optional(),
    rel: z.string().optional(),
    icon: z.string().optional(),
    target: z.string().optional(),
    hoverEffect: z
      .enum(["text-flip", "creative-fill", "magnetic", "magnetic-text-flip"])
      .optional(),
    variant: z.enum(["fill", "outline", "text", "circle"]).optional(),
  })
  .passthrough();

export const sharedButtonTag = sharedButton.refine(
  (data) => data.tag !== "a" || !!data.url,
  {
    message: "`url` is required when `tag` is 'a'",
    path: ["url"],
  },
);

export const AppearanceEnum = z.enum(["dark", "light"]);
export const button = sharedButton || sharedButtonTag;

export const videoConfigSchema = z.object({
  src: z.string(),
  type: z.string().optional(),
  provider: z.enum(["youtube", "vimeo", "html5"]).optional(),
  poster: z.string().optional(),
  autoplay: z.boolean().optional(),
  id: z.string().optional(),
});

export const inputFieldSchema = z.object({
  label: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  halfWidth: z.boolean().optional(),
  defaultValue: z.string().optional(),
  name: z.string().optional(),
  selected: z.boolean().optional(),
  value: z.boolean().optional(),
  checked: z.boolean().optional(),
  type: z.enum(["text", "email", "radio", "checkbox"]).optional(),
  id: z.string().optional(),
  tag: z.literal("textarea").optional(),
  rows: z.string().optional(),
  group: z.string().optional(),
  groupLabel: z.string().optional(),
  items: z
    .array(
      z.object({
        label: z.string(),
        name: z.string().optional(),
        id: z.string().optional(),
        value: z.string().optional(),
        required: z.boolean().optional(),
        groupLabel: z.string().optional(),
        group: z.string().optional(),
        type: z.enum(["radio", "checkbox"]).optional(),
        halfWidth: z.boolean().optional(),
        defaultValue: z.string().optional(),
        checked: z.boolean().optional(),
      }),
    )
    .optional(),
  dropdown: z
    .object({
      type: z.enum(["select", "search"]).optional(),
      search: z
        .object({
          placeholder: z.string().optional(),
        })
        .optional(),
      items: z.array(
        z.object({
          label: z.string(),
          selected: z.literal(true),
          value: z.string(),
        }),
      ),
    })
    .optional(),
  content: z.string().optional(),
  note: z.enum(["info", "warning", "success", "deprecated", "hint"]).optional(),
  parentClass: z.string().optional(),
});

// ================================================================================
// SECTIONS SCHEMA
// ================================================================================

export const pricingSectionSchema = z
  .object({
    enable: z.boolean().default(false),
    title: z.string().optional(),
    list: z.array(
      z.object({
        enable: z.boolean().default(false),
        name: z.string(),
        description: z.string(),
        price: z.object({
          prependValue: z.string(),
          value: z.string(),
          appendValue: z.string(),
        }),
        features: z.array(z.string()),
        button,
      }),
    ),
  })
  .optional();

export const contactFormSchema = z.object({
  action: z.string().optional(),
  emailSubject: z.string().optional(),
  note: z.string().optional(),
  submitButton: z.object({
    label: z.string(),
  }),
  inputs: z.array(inputFieldSchema),
});

export const servicesSectionSchema = z
  .object({
    enable: z.boolean().default(false).optional(),
    title: z.string().optional(),
    sectionDirection: z.enum(["horizontal", "vertical"]).optional(),
    options: z
      .object({
        layout: z.enum(["grid", "accordion"]),
        appearance: AppearanceEnum,
        limit: z.union([z.number(), z.literal(false)]),
        column: z.union([z.literal(1), z.literal(2), z.literal(3)]).optional(),
        iconPlacement: z.enum(["top", "right"]).optional(),
      })
      .partial()
      .optional(),
  })
  .optional();

export const clientsSectionSchema = z
  .object({
    enable: z.boolean().default(false).optional(), // Control section visibility
    title: z.string().optional(),
    list: z
      .array(
        z.object({
          alt: z.string(),
          src: z.string(),
        }),
      )
      .optional(),
    options: z
      .object({
        appearance: AppearanceEnum.optional(),
        columnsPerRow: z.union([z.literal(4), z.literal(6)]).optional(), // Default is 4
      })
      .partial()
      .optional(),
  })
  .optional();

export const bannerAgencySectionSchema = z
  .object({
    enable: z.boolean().default(false).optional(),
    titleSize: z.enum(["display-1", "display-2", "display-3"]).optional(),
    title: z.array(z.string()).optional(),
    badge: z
      .object({
        enable: z.boolean().default(false).optional(),
        label: z.string().optional(),
        icon: z.string().optional(),
      })
      .partial()
      .optional(),
  })
  .optional();

export const sectionsSchema = {
  servicesSection: servicesSectionSchema,
  clientsSection: clientsSectionSchema,
  bannerAgencySection: bannerAgencySectionSchema,
  pricingSection: pricingSectionSchema,
};
