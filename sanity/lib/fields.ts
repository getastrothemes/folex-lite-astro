/**
 * Field factories reused by many schema types, so every image, language and
 * "Hide this section" field behaves the same everywhere.
 */
import { defineArrayMember, defineField } from "sanity";
import { languageOptions } from "./languages";

/** The "Alternative text" field added to every image. */
export function altField() {
  return defineField({
    name: "alt",
    title: "Alternative text",
    type: "string",
    description:
      'Describe the image for screen readers and search engines, e.g. "Team planning a project at a desk". Leave empty only for purely decorative images.',
    validation: (rule) =>
      rule
        .custom((alt, context) => {
          const parent = context.parent as { asset?: unknown } | undefined;
          if (parent?.asset && !alt) {
            return "Add alternative text so everyone can understand the image (leave empty only if it is decorative).";
          }
          return true;
        })
        .warning(),
  });
}

interface ImageFieldOptions {
  name: string;
  title: string;
  description?: string;
  group?: string | string[];
  required?: boolean;
}

/** An image field with hotspot/crop and alternative text. */
export function imageField({
  name,
  title,
  description,
  group,
  required,
}: ImageFieldOptions) {
  return defineField({
    name,
    title,
    type: "image",
    description,
    group,
    options: { hotspot: true },
    fields: [altField()],
    validation: required
      ? (rule) =>
          rule
            .custom((value: { asset?: unknown } | undefined) =>
              value?.asset ? true : `Please upload an image for "${title}".`,
            )
            .error()
      : undefined,
  });
}

/** An image used inside an array (gallery, client logos). */
export function imageArrayMember(title = "Image") {
  return defineArrayMember({
    type: "image",
    title,
    options: { hotspot: true },
    fields: [altField()],
  });
}

/** The `language` field. Per-language singletons show it read-only. */
export function languageField({
  readOnly = false,
  group,
}: { readOnly?: boolean; group?: string } = {}) {
  return defineField({
    name: "language",
    title: "Language",
    type: "string",
    group,
    readOnly,
    description: readOnly
      ? "This document belongs to this language. It is set automatically."
      : "Which language version of the website this belongs to. It is preset when you create it from a language list.",
    options: {
      list: languageOptions,
      layout: "radio",
      direction: "horizontal",
    },
    validation: (rule) => rule.required().error("Choose a language."),
  });
}

/**
 * The "Hide this section" switch shared by every page section.
 * Pass `grouped = false` for sections without Content/Settings tabs.
 */
export function hiddenSectionField(grouped = true) {
  return defineField({
    name: "hidden",
    title: "Hide this section",
    type: "boolean",
    description:
      "Turn on to hide this section on the website without deleting it.",
    initialValue: false,
    group: grouped ? ["content", "settings"] : undefined,
  });
}

/** Section groups: "Content" (default tab) and "Settings" (layout options). */
export const sectionGroups = [
  { name: "content", title: "Content", default: true },
  { name: "settings", title: "Settings" },
];

/** Groups used by documents: Content (default tab), SEO and Settings. */
export const documentGroups = [
  { name: "content", title: "Content", default: true },
  { name: "seo", title: "SEO" },
  { name: "settings", title: "Settings" },
];
