import { CreditCardIcon } from "@sanity/icons/CreditCard";
import { defineArrayMember, defineField, defineType } from "sanity";

/** One pricing card in a Pricing section. */
export const pricingPlan = defineType({
  name: "pricingPlan",
  title: "Pricing plan",
  type: "object",
  icon: CreditCardIcon,
  fields: [
    defineField({
      name: "name",
      title: "Plan name",
      type: "string",
      description: 'e.g. "Personal", "Startup" or "Corporate".',
      validation: (rule) => rule.required().error("Add a plan name."),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 2,
      description: "A short sentence about who the plan is for.",
    }),
    defineField({
      name: "pricePrefix",
      title: "Before the price",
      type: "string",
      description: 'Usually a currency symbol, e.g. "$" or "€".',
      initialValue: "$",
    }),
    defineField({
      name: "price",
      title: "Price",
      type: "string",
      description: 'The amount, e.g. "180" or "Free".',
    }),
    defineField({
      name: "priceSuffix",
      title: "After the price",
      type: "string",
      description: 'Billing period, e.g. "/mo" or "/year".',
      initialValue: "/mo",
    }),
    defineField({
      name: "features",
      title: "Features",
      type: "array",
      description:
        'What the plan includes, one per line, e.g. "Free custom domain".',
      of: [defineArrayMember({ type: "string" })],
    }),
    defineField({
      name: "button",
      title: "Button",
      type: "link",
      initialValue: {
        enabled: true,
        label: "Choose this plan",
        url: "/contact/",
      },
    }),
  ],
  preview: {
    select: {
      title: "name",
      prefix: "pricePrefix",
      price: "price",
      suffix: "priceSuffix",
    },
    prepare: ({ title, prefix, price, suffix }) => ({
      title: title || "Untitled plan",
      subtitle: price
        ? `${prefix ?? ""}${price}${suffix ?? ""}`
        : "No price yet",
    }),
  },
});
