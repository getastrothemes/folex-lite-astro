import type { SectionFileKey } from "@/lib/pageSections";

/** Content entry shape shared by Astro content collections and Tina data. */
export type ContentEntry = {
  id: string;
  filePath?: string;
  collection: string;
  data: Record<string, any>;
  /** Rich text from Tina, rendered with TinaMarkdown in the live preview. */
  tinaBody?: unknown;
};

/** Everything the page sections of one page need to render. */
export type SectionsBundle = {
  data: Partial<Record<SectionFileKey, any>>;
  services: ContentEntry[] | any[];
  projects: ContentEntry[] | any[];
};

/** Data for the footer region. Missing keys fall back to the static files. */
export type FooterData = {
  cta?: Record<string, any>;
  form?: Record<string, any>;
  settings?: Record<string, any>;
  social?: Record<string, any>[];
  dictionary?: Record<string, any>;
};
