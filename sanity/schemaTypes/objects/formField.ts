import { EditIcon } from "@sanity/icons/Edit";
import { defineArrayMember, defineField, defineType } from "sanity";

const FIELD_TYPES = [
  { title: "Short text", value: "text" },
  { title: "Email address", value: "email" },
  { title: "Long text (message box)", value: "textarea" },
  { title: "Dropdown", value: "select" },
  { title: "Dropdown with search", value: "searchSelect" },
  { title: "Radio buttons (pick one)", value: "radio" },
  { title: "Checkbox", value: "checkbox" },
];

type FieldParent = { fieldType?: string } | undefined;

/** True when the form field is one of the given field types. */
const isType = (parent: FieldParent, ...types: string[]) =>
  types.includes(parent?.fieldType ?? "");

/** `hidden` callback that shows a setting only for the given field types. */
const onlyFor =
  (...types: string[]) =>
  ({ parent }: { parent?: FieldParent }) =>
    !isType(parent, ...types);

/** A field in the footer contact form. */
export const formField = defineType({
  name: "formField",
  title: "Form field",
  type: "object",
  icon: EditIcon,
  fields: [
    defineField({
      name: "fieldType",
      title: "Field type",
      type: "string",
      description: "What kind of input visitors fill in.",
      options: { list: FIELD_TYPES },
      initialValue: "text",
      validation: (rule) => rule.required().error("Choose a field type."),
    }),
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      description:
        'Text shown above the field, e.g. "Your name". For a checkbox, the text next to it.',
    }),
    defineField({
      name: "name",
      title: "Field name (for submissions)",
      type: "string",
      description:
        'Name the answer is sent under in the email, e.g. "Full Name" or "Email Address". Use letters, numbers, spaces, dashes or underscores. Each field needs its own name.',
      validation: (rule) => [
        rule.required().error('Add a field name, e.g. "Full Name".'),
        rule
          .regex(/^[\p{L}\p{N}][\p{L}\p{N} _-]*$/u)
          .error(
            "Use only letters, numbers, spaces, dashes (-) and underscores (_), starting with a letter or number.",
          ),
      ],
    }),
    defineField({
      name: "placeholder",
      title: "Placeholder",
      type: "string",
      description: 'Hint text shown inside an empty field, e.g. "John Doe".',
      hidden: ({ parent }) => isType(parent, "radio", "checkbox"),
    }),
    defineField({
      name: "required",
      title: "Required",
      type: "boolean",
      description: "Visitors must fill in this field before sending.",
      initialValue: false,
    }),
    defineField({
      name: "halfWidth",
      title: "Half width",
      type: "boolean",
      description:
        "Show this field at half width on larger screens, so two fields sit side by side.",
      initialValue: false,
    }),
    defineField({
      name: "rows",
      title: "Height (rows)",
      type: "number",
      description:
        "How many lines of text the message box shows, e.g. 4. Leave empty for the default height.",
      hidden: onlyFor("textarea"),
      validation: (rule) =>
        rule.integer().min(1).max(20).error("Use a whole number from 1 to 20."),
    }),
    defineField({
      name: "groupLabel",
      title: "Question",
      type: "string",
      description:
        'Question shown above the radio buttons, e.g. "How did you hear about us?".',
      hidden: onlyFor("radio"),
    }),
    defineField({
      name: "options",
      title: "Options",
      type: "array",
      description: "The choices visitors can pick from.",
      of: [defineArrayMember({ type: "formOption" })],
      hidden: onlyFor("select", "searchSelect", "radio"),
      validation: (rule) =>
        rule.custom((value: unknown[] | undefined, context) => {
          const needsOptions = isType(
            context.parent as FieldParent,
            "select",
            "searchSelect",
            "radio",
          );
          return needsOptions && !value?.length
            ? "Add at least one option."
            : true;
        }),
    }),
    defineField({
      name: "searchPlaceholder",
      title: "Search placeholder",
      type: "string",
      description:
        'Hint text in the search box of the dropdown, e.g. "Search services…".',
      hidden: onlyFor("searchSelect"),
    }),
    defineField({
      name: "checkboxValue",
      title: "Submitted value when checked",
      type: "string",
      description:
        'What you receive in the email when the box is ticked, e.g. "yes".',
      hidden: onlyFor("checkbox"),
    }),
  ],
  preview: {
    select: {
      label: "label",
      groupLabel: "groupLabel",
      name: "name",
      fieldType: "fieldType",
      required: "required",
    },
    prepare: ({ label, groupLabel, name, fieldType, required }) => ({
      title: `${label || groupLabel || name || "Untitled field"}${required ? " *" : ""}`,
      subtitle: `${FIELD_TYPES.find((type) => type.value === fieldType)?.title ?? "Field"}${name ? ` · ${name}` : ""}`,
    }),
  },
});
