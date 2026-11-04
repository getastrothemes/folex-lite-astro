import config from ".astro/config.generated.json";
import { getCollectionCTM, getEntryCTM } from "@/lib/contentParser.astro";
import {
  PAGE_SECTIONS,
  type PageSectionKey,
  type SectionFileKey,
} from "@/lib/pageSections";
import type { SectionsBundle } from "./types";

// Static data for page sections, read from Astro content collections. This is
// what every built page uses. The Tina equivalent (tinaData.ts) is only used
// by the live visual editing route.

export async function loadSectionsFromCollections(
  sections: PageSectionKey[],
  lang: string | undefined,
): Promise<SectionsBundle> {
  const bundle: SectionsBundle = { data: {}, services: [], projects: [] };

  const keys = [...new Set(sections)].filter(
    (key): key is SectionFileKey => key !== "content",
  );

  await Promise.all(
    keys.map(async (key) => {
      const entry = await getEntryCTM("sections", PAGE_SECTIONS[key].file, lang);
      bundle.data[key] = entry?.data;
    }),
  );

  if (keys.includes("services")) {
    bundle.services = await getCollectionCTM("services", lang);
  }
  if (keys.includes("portfolio")) {
    bundle.projects = await getCollectionCTM(
      config.settings.portfolioFolder as "portfolio",
      lang,
    );
  }

  return bundle;
}
