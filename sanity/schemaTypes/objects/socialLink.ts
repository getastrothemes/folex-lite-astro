import { ShareIcon } from "@sanity/icons/Share";
import { defineField, defineType } from "sanity";

const PLATFORMS = [
  { title: "Facebook", value: "facebook" },
  { title: "X (Twitter)", value: "twitter" },
  { title: "Instagram", value: "instagram" },
  { title: "LinkedIn", value: "linkedin" },
  { title: "WhatsApp", value: "whatsapp" },
];

/** A social media profile link with its icon. */
export const socialLink = defineType({
  name: "socialLink",
  title: "Social link",
  type: "object",
  icon: ShareIcon,
  fields: [
    defineField({
      name: "platform",
      title: "Platform",
      type: "string",
      description: "Picks the icon shown on the website.",
      options: { list: PLATFORMS },
      validation: (rule) => rule.required().error("Choose a platform."),
    }),
    defineField({
      name: "url",
      title: "Profile URL",
      type: "url",
      description:
        'Full address of your profile, e.g. "https://www.instagram.com/yourcompany".',
      validation: (rule) =>
        rule
          .required()
          .error("Add the profile URL.")
          .uri({ scheme: ["http", "https"] }),
    }),
  ],
  preview: {
    select: { platform: "platform", url: "url" },
    prepare: ({ platform, url }) => ({
      title:
        PLATFORMS.find((item) => item.value === platform)?.title ||
        "Choose a platform",
      subtitle: url,
    }),
  },
});
