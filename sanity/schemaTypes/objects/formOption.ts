import { CheckmarkIcon } from "@sanity/icons/Checkmark";
import { defineField, defineType } from "sanity";

/** One choice in a select, search-select or radio form field. */
export const formOption = defineType({
  name: "formOption",
  title: "Option",
  type: "object",
  icon: CheckmarkIcon,
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description: 'What visitors see, e.g. "Web design".',
      validation: (rule) => rule.required().error("Add the text visitors see."),
    }),
    defineField({
      name: "value",
      title: "Submitted value",
      type: "string",
      description:
        'What you receive in the email. Leave empty to use the label, e.g. "web-design".',
    }),
  ],
  preview: {
    select: { title: "label", value: "value" },
    prepare: ({ title, value }) => ({
      title: title || "Untitled option",
      subtitle: value,
    }),
  },
});
