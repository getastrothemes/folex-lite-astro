import { InfoOutlineIcon } from "@sanity/icons/InfoOutline";
import { defineField, defineType } from "sanity";

const VALUE_TYPES = [
  { title: "Custom text", value: "custom" },
  { title: "Project categories", value: "categories" },
  { title: "Project date", value: "date" },
];

/** A row in the project "details" list, e.g. "Client: Eunice Mills". */
export const projectDetail = defineType({
  name: "projectDetail",
  title: "Project detail",
  type: "object",
  icon: InfoOutlineIcon,
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: 'e.g. "Client:", "Software:" or "Date:".',
      validation: (rule) => rule.required().error("Add a label."),
    }),
    defineField({
      name: "valueType",
      title: "Value",
      type: "string",
      description:
        "Type your own text, or show the project's categories or date automatically.",
      options: { list: VALUE_TYPES, layout: "radio", direction: "horizontal" },
      initialValue: "custom",
    }),
    defineField({
      name: "value",
      title: "Text",
      type: "string",
      description: 'e.g. "WordPress, Figma" or "Eunice Mills".',
      hidden: ({ parent }) => (parent?.valueType ?? "custom") !== "custom",
    }),
  ],
  preview: {
    select: { label: "label", valueType: "valueType", value: "value" },
    prepare: ({ label, valueType, value }) => ({
      title: label || "Untitled detail",
      subtitle:
        valueType && valueType !== "custom"
          ? `Shows the ${VALUE_TYPES.find((item) => item.value === valueType)?.title.toLowerCase()}`
          : value,
    }),
  },
});
