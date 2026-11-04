// Sections that can be added, removed and reordered on a page from the CMS
// (the `sections` frontmatter list). Each one renders an existing section
// component with its shared content file in `src/content/sections/{language}/`.

export const PAGE_SECTIONS = {
  content: { label: "Page text", file: null },
  banner: { label: "Hero banner", file: "banner" },
  clients: { label: "Client logos", file: "clients" },
  services: { label: "Services", file: "services-section" },
  portfolio: { label: "Portfolio", file: "portfolio-section" },
  pricing: { label: "Pricing plans", file: "pricing-section" },
} as const;

export type PageSectionKey = keyof typeof PAGE_SECTIONS;
export type SectionFileKey = Exclude<PageSectionKey, "content">;

export type PageSectionItem = { section?: PageSectionKey | null };

/** Section order used when a page has no `sections` list. */
export const DEFAULT_HOME_SECTIONS: PageSectionKey[] = [
  "banner",
  "clients",
  "services",
  "portfolio",
  "pricing",
];
export const DEFAULT_PAGE_SECTIONS: PageSectionKey[] = ["content"];

export const isPageSectionKey = (value: unknown): value is PageSectionKey =>
  typeof value === "string" && value in PAGE_SECTIONS;

/** Resolves a page's section list, falling back to the default order. */
export const resolveSections = (
  items: PageSectionItem[] | null | undefined,
  fallback: PageSectionKey[],
): PageSectionKey[] =>
  Array.isArray(items) && items.length
    ? items.map((item) => item?.section).filter(isPageSectionKey)
    : fallback;
