import { defineArrayMember, defineType } from "sanity";

/**
 * The page builder: an ordered list of sections. Drag to reorder, use the
 * "Hide this section" switch to hide one without deleting it.
 */
export const pageSections = defineType({
  name: "pageSections",
  title: "Page sections",
  type: "array",
  of: [
    defineArrayMember({ type: "bannerSection" }),
    defineArrayMember({ type: "clientsSection" }),
    defineArrayMember({ type: "servicesSection" }),
    defineArrayMember({ type: "portfolioSection" }),
    defineArrayMember({ type: "pricingSection" }),
    defineArrayMember({ type: "contentSection" }),
  ],
  options: {
    insertMenu: {
      filter: false,
      showIcons: true,
      groups: [
        {
          name: "intro",
          title: "Intro",
          of: ["bannerSection", "clientsSection"],
        },
        {
          name: "showcase",
          title: "Showcase",
          of: ["servicesSection", "portfolioSection", "pricingSection"],
        },
        { name: "text", title: "Text", of: ["contentSection"] },
      ],
      views: [{ name: "list" }],
    },
  },
});
