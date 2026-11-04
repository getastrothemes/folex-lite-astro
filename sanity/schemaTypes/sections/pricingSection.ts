import { CreditCardIcon } from "@sanity/icons/CreditCard";
import { defineArrayMember, defineField, defineType } from "sanity";
import { hiddenSectionField } from "../../lib/fields";
import { arrayLength, countLabel, sectionTitle } from "../../lib/preview";

/** Pricing cards with features and a button each. */
export const pricingSection = defineType({
  name: "pricingSection",
  title: "Pricing",
  type: "object",
  icon: CreditCardIcon,
  description: "Pricing plans side by side, each with features and a button.",
  fields: [
    hiddenSectionField(false),
    defineField({
      name: "title",
      title: "Heading",
      type: "string",
      description: 'Optional, e.g. "Simple pricing".',
    }),
    defineField({
      name: "plans",
      title: "Plans",
      type: "array",
      description:
        "Up to three plans sit side by side on large screens (two on tablets, one on phones).",
      of: [defineArrayMember({ type: "pricingPlan" })],
    }),
  ],
  preview: {
    select: { title: "title", hidden: "hidden", plans: "plans" },
    prepare: ({ title, hidden, plans }) => ({
      title: sectionTitle("Pricing", title, hidden),
      subtitle: countLabel(arrayLength(plans), "plan"),
      media: CreditCardIcon,
    }),
  },
});
