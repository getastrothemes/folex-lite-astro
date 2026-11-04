import type { SectionFileKey } from "../pageSections";

// Names shared by the Tina schema (tina/config.ts) and the Tina data loaders.

/** Tina collection names allow letters, numbers and underscores only. */
export const languageSuffix = (languageCode: string) =>
  languageCode.replace(/[^a-zA-Z0-9]/g, "_");

export const pagesCollectionName = (languageCode: string) =>
  `pages_${languageSuffix(languageCode)}`;
export const portfolioCollectionName = (languageCode: string) =>
  `portfolio_${languageSuffix(languageCode)}`;
export const servicesCollectionName = (languageCode: string) =>
  `services_${languageSuffix(languageCode)}`;

/** Tina collection for each page section's shared content file. */
export const SECTION_COLLECTIONS: Record<SectionFileKey, string> = {
  banner: "banner",
  clients: "clients",
  services: "servicesSection",
  portfolio: "portfolioSection",
  pricing: "pricingSection",
};
